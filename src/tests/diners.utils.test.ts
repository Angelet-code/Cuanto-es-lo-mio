import { describe, expect, it } from "vitest";
import { buildDiner } from "../features/diners/diners.utils";
import type { TicketItem } from "../features/ticket/ticket.types";

const items: TicketItem[] = [
  { id: "1", name: "Agua", quantity: 1, totalPrice: 2.4, isAssigned: false },
  { id: "2", name: "Croquetas", quantity: 1, totalPrice: 8.5, isAssigned: false },
  { id: "3", name: "Pan", quantity: 1, totalPrice: 1.6, isAssigned: false },
];

describe("buildDiner", () => {
  it("calculates diner total from selected items", () => {
    const diner = buildDiner("Comensal 1", ["1", "3"], items);

    expect(diner.total).toBe(4);
    expect(diner.itemIds).toEqual(["1", "3"]);
  });
});
