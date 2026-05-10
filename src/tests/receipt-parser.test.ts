import { describe, expect, it } from "vitest";
import { parseReceiptText } from "../features/extraction/receipt-parser";
import type { TicketDraftItem } from "../features/ticket/ticket.types";

function compact(items: TicketDraftItem[]) {
  return items.map(({ name, quantity, unitPrice, totalPrice, readStatus, excludedFromTotal }) => ({
    name,
    quantity,
    unitPrice,
    totalPrice,
    readStatus,
    excludedFromTotal,
  }));
}

describe("parseReceiptText", () => {
  it("extracts repeated units and total from receipt text", () => {
    const result = parseReceiptText(`
      BAR LA MESA
      1 CROQUETAS 8,50
      4 CERVEZA 3,20 12,80
      ENSALADILLA 8,80
      2 PAN 1,80 3,60
      TOTAL 33,70
    `);

    expect(result.detectedTotal).toBe(33.7);
    expect(compact(result.items)).toEqual([
      { name: "Croquetas", quantity: 1, unitPrice: 8.5, totalPrice: 8.5, readStatus: "warning", excludedFromTotal: undefined },
      { name: "Cerveza", quantity: 4, unitPrice: 3.2, totalPrice: 12.8, readStatus: "sure", excludedFromTotal: false },
      { name: "Ensaladilla", quantity: 1, unitPrice: 8.8, totalPrice: 8.8, readStatus: "warning", excludedFromTotal: undefined },
      { name: "Pan", quantity: 2, unitPrice: 1.8, totalPrice: 3.6, readStatus: "sure", excludedFromTotal: false },
    ]);
  });

  it("handles multiplier format", () => {
    const result = parseReceiptText(`
      CERVEZA 4 x 3,20 12,80
      TOTAL 12,80
    `);

    expect(result.items[0]).toMatchObject({
      name: "Cerveza",
      quantity: 4,
      unitPrice: 3.2,
      totalPrice: 12.8,
      readStatus: "warning",
    });
  });

  it("ignores payment lines after the total", () => {
    const result = parseReceiptText(`
      1 CROQUETAS 8,50 8,50
      2 BURGER 15,00 30,00
      TOTAL 38,50
      CREDITO 38,50
      CREDITO 33,67
    `);

    expect(result.detectedTotal).toBe(38.5);
    expect(compact(result.items)).toEqual([
      { name: "Croquetas", quantity: 1, unitPrice: 8.5, totalPrice: 8.5, readStatus: "sure", excludedFromTotal: false },
      { name: "Burger", quantity: 2, unitPrice: 15, totalPrice: 30, readStatus: "sure", excludedFromTotal: false },
    ]);
  });

  it("handles decimal quantity columns", () => {
    const result = parseReceiptText(`
      2,00 BURGER DOBLE 14,50 29,00
      TOTAL 29,00
    `);

    expect(result.items[0]).toMatchObject({
      name: "Burger Doble",
      quantity: 2,
      unitPrice: 14.5,
      totalPrice: 29,
      readStatus: "sure",
    });
  });

  it("repairs short noisy item names using a nearby same-price item", () => {
    const result = parseReceiptText(`
      1 - O me 2,50 2,50
      1 CANA 2,50 2,50
      TOTAL 5,00
    `);

    expect(compact(result.items)).toEqual([
      { name: "Cana", quantity: 1, unitPrice: 2.5, totalPrice: 2.5, readStatus: "warning", excludedFromTotal: false },
      { name: "Cana", quantity: 1, unitPrice: 2.5, totalPrice: 2.5, readStatus: "sure", excludedFromTotal: false },
    ]);
  });

  it("uses the sum of valid item lines instead of printed credit totals", () => {
    const result = parseReceiptText(`
      1 CANA 2,50 2,50
      1 CANA 2,50 2,50
      2 BURGER 180G 14,00 28,00
      1 PATATAS 7,00 7,00
      TOTAL 39,70
      CREDITO 39,70
      CREDITO 33,67
    `);

    expect(result.detectedTotal).toBe(40);
    expect(compact(result.items)).toEqual([
      { name: "Cana", quantity: 1, unitPrice: 2.5, totalPrice: 2.5, readStatus: "sure", excludedFromTotal: false },
      { name: "Cana", quantity: 1, unitPrice: 2.5, totalPrice: 2.5, readStatus: "sure", excludedFromTotal: false },
      { name: "Burger 180G", quantity: 2, unitPrice: 14, totalPrice: 28, readStatus: "sure", excludedFromTotal: false },
      { name: "Patatas", quantity: 1, unitPrice: 7, totalPrice: 7, readStatus: "sure", excludedFromTotal: false },
    ]);
    expect(result.warnings?.[0]).toContain("total impreso");
  });

  it("does not trust quantity when unit price and line total are the same", () => {
    const result = parseReceiptText(`
      2 ENTRECOTTE 18,00 18,00
      TOTAL 18,00
    `);

    expect(result.detectedTotal).toBe(18);
    expect(result.items[0]).toMatchObject({
      name: "Entrecotte",
      quantity: 1,
      unitPrice: 18,
      totalPrice: 18,
      readStatus: "warning",
    });
  });

  it("prints impossible column lines as red and excludes them from totals", () => {
    const result = parseReceiptText(`
      2 BURGER 180G 14,00 18,00
      1 PATATAS 7,00 7,00
      TOTAL 25,00
    `);

    expect(result.detectedTotal).toBe(7);
    expect(compact(result.items)).toEqual([
      { name: "Burger 180G", quantity: 2, unitPrice: 14, totalPrice: 18, readStatus: "error", excludedFromTotal: true },
      { name: "Patatas", quantity: 1, unitPrice: 7, totalPrice: 7, readStatus: "sure", excludedFromTotal: false },
    ]);
    expect(result.warnings?.[0]).toContain("total impreso");
  });

  it("removes OCR garbage before the quantity column", () => {
    const result = parseReceiptText(`
      E 1 CARRILLERA 18,00 18,00
      To 2 BURGER 180G 14,00 28,00
      TOTAL 46,00
    `);

    expect(compact(result.items)).toEqual([
      { name: "Carrillera", quantity: 1, unitPrice: 18, totalPrice: 18, readStatus: "sure", excludedFromTotal: false },
      { name: "Burger 180G", quantity: 2, unitPrice: 14, totalPrice: 28, readStatus: "sure", excludedFromTotal: false },
    ]);
  });

  it("ignores cash handed over and change lines", () => {
    const result = parseReceiptText(`
      FACTURA SIMPLIFICADA
      1 CARRILLERA 18,00 18,00
      2 BURGER 180G 14,00 28,00
      TOTAL 46,00
      ENTREGA: 115,00
      CAMBIO: 69,00
    `);

    expect(result.detectedTotal).toBe(46);
    expect(compact(result.items)).toEqual([
      { name: "Carrillera", quantity: 1, unitPrice: 18, totalPrice: 18, readStatus: "sure", excludedFromTotal: false },
      { name: "Burger 180G", quantity: 2, unitPrice: 14, totalPrice: 28, readStatus: "sure", excludedFromTotal: false },
    ]);
  });
});
