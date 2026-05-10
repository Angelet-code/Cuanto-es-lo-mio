export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseMoneyInput(value: string): number {
  const normalized = value.replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
}
