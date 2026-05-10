import { describe, expect, it } from "vitest";
import { validateTicketTotal } from "../features/ticket/ticket.validation";
import { createTicketItemsFromDraft } from "../features/ticket/ticket.utils";
import type { TicketItem } from "../features/ticket/ticket.types";

const items: TicketItem[] = [
  { id: "1", name: "Cafe", quantity: 2, totalPrice: 3.4, isAssigned: false },
  { id: "2", name: "Tortilla", quantity: 1, totalPrice: 7.2, isAssigned: false },
];

describe("validateTicketTotal", () => {
  it("detects matching totals", () => {
    const result = validateTicketTotal(items, 10.6);

    expect(result.itemsTotal).toBe(10.6);
    expect(result.hasDifference).toBe(false);
  });

  it("reports differences", () => {
    const result = validateTicketTotal(items, 12);

    expect(result.difference).toBe(1.4);
    expect(result.hasDifference).toBe(true);
  });
});

describe("createTicketItemsFromDraft", () => {
  it("expands repeated products into individual selectable items", () => {
    const result = createTicketItemsFromDraft({
      name: "Cerveza",
      quantity: 4,
      unitPrice: 3.2,
      totalPrice: 12.8,
    });

    expect(result).toHaveLength(4);
    expect(result.map((item) => item.totalPrice)).toEqual([3.2, 3.2, 3.2, 3.2]);
    expect(result.every((item) => item.quantity === 1)).toBe(true);
  });
});
