import { roundMoney } from "../../services/currency.service";
import type { TicketDraftItem, TicketItemReadStatus } from "../ticket/ticket.types";
import type { TicketExtractionResult } from "./extraction.types";

const ignoredLinePatterns = [
  /cif|nif|tel|direccion|dirección|fecha|hora/i,
  /mesa|camarero|factura|simplificada|ticket/i,
  /subtotal|base|iva|impuesto|tarjeta|efectivo|cambio|entrega|entregado|recibido|devuelto|cr[eé]dito|credito|visa|mastercard|bizum/i,
];

const totalLinePattern = /\b(total|importe|a pagar|pagar)\b/i;
const moneyPattern = /-?\d{1,4}(?:[,.]\d{2})/g;
const columnLinePattern =
  /^\s*(?<quantity>\d{1,2}(?:[,.]00)?)\s+(?<name>.+?)\s+(?<unitPrice>\d{1,4}[,.]\d{2})\s+(?<totalPrice>\d{1,4}[,.]\d{2})\s*$/;

export function parseReceiptText(text: string): TicketExtractionResult {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const receiptTotal = findReceiptTotal(lines);
  const items = repairSuspiciousNames(lines.flatMap(parseItemLine));

  if (items.length === 0) {
    throw new Error("No receipt items detected");
  }

  const detectedTotal = getItemsTotal(items);

  return {
    detectedTotal,
    items,
    warnings: buildWarnings(items, receiptTotal),
  };
}

function normalizeLine(line: string): string {
  const normalized = line.replace(/\s+/g, " ").trim();
  const firstQuantity = normalized.search(/\b\d{1,2}(?:[,.]00)?\s+(?![xX]\b)[^\d\s].*\d{1,4}[,.]\d{2}/);

  if (firstQuantity > 0 && !looksLikeHeaderOrPayment(normalized)) {
    return normalized.slice(firstQuantity).trim();
  }

  return normalized;
}

function findReceiptTotal(lines: string[]): number | undefined {
  const totalCandidates = lines
    .filter((line) => totalLinePattern.test(line))
    .flatMap((line) => extractMoneyValues(line));

  if (totalCandidates.length > 0) {
    return totalCandidates.at(-1);
  }

  const allValues = lines.flatMap((line) => extractMoneyValues(line));
  return allValues.length > 0 ? Math.max(...allValues) : undefined;
}

function parseItemLine(line: string): TicketDraftItem[] {
  if (shouldIgnoreLine(line)) {
    return [];
  }

  const columnMatch = line.match(columnLinePattern);

  if (columnMatch) {
    const columnItem = parseColumnItemLine(columnMatch);
    if (!columnItem) {
      return [];
    }
    return [columnItem];
  }

  const moneyValues = extractMoneyValues(line);

  if (moneyValues.length === 0) {
    return [];
  }

  const totalPrice = moneyValues.at(-1);

  if (!totalPrice || totalPrice <= 0) {
    return [];
  }

  const quantity = detectQuantity(line);
  const unitPrice = detectUnitPrice(line, quantity, totalPrice, moneyValues);
  const name = cleanItemName(line);

  if (!name || name.length < 2 || isLikelyOnlyNumbers(name)) {
    return [];
  }

  return [
    {
      name,
      quantity,
      unitPrice,
      totalPrice,
      readStatus: quantity > 1 ? "warning" : "warning",
      readReason: quantity > 1 ? "Cantidad inferida sin columnas completas." : "Linea sin columnas completas.",
    },
  ];
}

function parseColumnItemLine(match: RegExpMatchArray): TicketDraftItem | undefined {
  if (!match.groups) {
    return undefined;
  }

  const quantity = parseQuantity(match.groups.quantity);
  const unitPrice = parseMoney(match.groups.unitPrice);
  const printedTotalPrice = parseMoney(match.groups.totalPrice);
  const name = cleanItemName(match.groups.name);
  const resolved = resolveColumnMath(quantity, unitPrice, printedTotalPrice);

  if (!name || unitPrice <= 0 || printedTotalPrice <= 0) {
    return undefined;
  }

  if (!resolved) {
    return {
      name,
      quantity,
      unitPrice,
      totalPrice: printedTotalPrice,
      readStatus: "error",
      readReason: `No cuadra: ${quantity} x ${unitPrice.toFixed(2)} no es ${printedTotalPrice.toFixed(2)}.`,
      excludedFromTotal: true,
    };
  }

  return {
    name,
    quantity: resolved.quantity,
    unitPrice,
    totalPrice: resolved.totalPrice,
    readStatus: resolved.status,
    readReason: resolved.reason,
    excludedFromTotal: false,
  };
}

function resolveColumnMath(
  quantity: number,
  unitPrice: number,
  printedTotalPrice: number,
): { quantity: number; totalPrice: number; status: TicketItemReadStatus; reason?: string } | undefined {
  const calculatedTotal = roundMoney(quantity * unitPrice);

  if (isCloseMoney(calculatedTotal, printedTotalPrice)) {
    return { quantity, totalPrice: calculatedTotal, status: "sure" };
  }

  if (isCloseMoney(unitPrice, printedTotalPrice)) {
    return {
      quantity: 1,
      totalPrice: printedTotalPrice,
      status: "warning",
      reason: "Cantidad corregida a 1: precio e importe coinciden.",
    };
  }

  const inferredQuantity = Math.round(printedTotalPrice / unitPrice);

  if (inferredQuantity >= 1 && inferredQuantity <= 20 && isCloseMoney(roundMoney(inferredQuantity * unitPrice), printedTotalPrice)) {
    return {
      quantity: inferredQuantity,
      totalPrice: printedTotalPrice,
      status: "warning",
      reason: "Cantidad inferida desde precio e importe.",
    };
  }

  return undefined;
}

function isCloseMoney(a: number, b: number): boolean {
  return Math.abs(roundMoney(a - b)) <= 0.05;
}

function shouldIgnoreLine(line: string): boolean {
  if (looksLikeHeaderOrPayment(line)) {
    return true;
  }

  return totalLinePattern.test(line);
}

function looksLikeHeaderOrPayment(line: string): boolean {
  return ignoredLinePatterns.some((pattern) => pattern.test(line)) || totalLinePattern.test(line);
}

function extractMoneyValues(line: string): number[] {
  return [...line.matchAll(moneyPattern)].map((match) => parseMoney(match[0])).filter((value) => value > 0);
}

function parseMoney(value: string): number {
  return roundMoney(Number(value.replace(",", ".")));
}

function detectQuantity(line: string): number {
  const leadingQuantity = line.match(/^\s*(\d{1,2}(?:[,.]00)?)\s+[^\d]/);

  if (leadingQuantity) {
    return parseQuantity(leadingQuantity[1]);
  }

  const multiplier = line.match(/\b(\d{1,2})\s*[xX]\s*\d{1,4}(?:[,.]\d{2})/);

  if (multiplier) {
    return Number(multiplier[1]);
  }

  return 1;
}

function parseQuantity(value: string): number {
  return Math.max(1, Math.trunc(Number(value.replace(",", "."))));
}

function detectUnitPrice(
  line: string,
  quantity: number,
  totalPrice: number,
  moneyValues: number[],
): number | undefined {
  if (quantity <= 1) {
    return moneyValues.length > 1 ? moneyValues.at(-2) : totalPrice;
  }

  const explicitUnitPrice = moneyValues.find((value) => roundMoney(value * quantity) === totalPrice);

  if (explicitUnitPrice) {
    return explicitUnitPrice;
  }

  return roundMoney(totalPrice / quantity);
}

function cleanItemName(line: string): string {
  const withoutPrices = line.replace(moneyPattern, " ");
  const withoutMultiplier = withoutPrices.replace(/\s+\d{1,2}\s*[xX]\s*/g, " ");
  const withoutLeadingQuantity = withoutMultiplier.replace(/^\s*\d{1,2}(?:[,.]00)?\s+/, " ");
  const withoutNoise = withoutLeadingQuantity.replace(/[^\p{L}\p{N}\s.'/()-]/gu, " ");

  return withoutNoise
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es-ES")
    .replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => `${space}${letter.toLocaleUpperCase("es-ES")}`)
    .replace(/\b(\d+)([a-z])\b/gi, (_, number: string, letter: string) => `${number}${letter.toLocaleUpperCase("es-ES")}`);
}

function isLikelyOnlyNumbers(value: string): boolean {
  return /^[\d\s.,-]+$/.test(value);
}

function repairSuspiciousNames(items: TicketDraftItem[]): TicketDraftItem[] {
  return items.map((item, index) => {
    if (!isSuspiciousName(item.name)) {
      return item;
    }

    const replacement = findNearbySamePriceName(items, index);
    return replacement
      ? { ...item, name: replacement, readStatus: "warning", readReason: "Nombre corregido por coincidencia de precio." }
      : item;
  });
}

function isSuspiciousName(name: string): boolean {
  const compact = name.replace(/[^\p{L}\p{N}]/gu, "");
  return compact.length <= 2 || /^O?Me$/i.test(compact);
}

function findNearbySamePriceName(items: TicketDraftItem[], index: number): string | undefined {
  const current = items[index];
  const candidates = items
    .map((item, candidateIndex) => ({ item, candidateIndex }))
    .filter(({ item, candidateIndex }) => candidateIndex !== index && !isSuspiciousName(item.name))
    .filter(({ item }) => item.unitPrice === current.unitPrice || item.totalPrice === current.totalPrice)
    .sort((a, b) => Math.abs(a.candidateIndex - index) - Math.abs(b.candidateIndex - index));

  return candidates[0]?.item.name;
}

function getItemsTotal(items: TicketDraftItem[]): number {
  return roundMoney(items.reduce((total, item) => total + (item.excludedFromTotal ? 0 : item.totalPrice), 0));
}

function buildWarnings(items: TicketDraftItem[], receiptTotal?: number): string[] {
  if (!receiptTotal) {
    return ["No se ha detectado el total impreso del ticket."];
  }

  const itemTotal = getItemsTotal(items);
  const difference = roundMoney(receiptTotal - itemTotal);

  return Math.abs(difference) >= 0.05
    ? [`La suma de lineas es ${itemTotal}, pero el total impreso es ${receiptTotal}.`]
    : [];
}
