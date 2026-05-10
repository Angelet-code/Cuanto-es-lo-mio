import { roundMoney } from "../../services/currency.service";
import type { TicketItem } from "./ticket.types";
import { getItemsTotal } from "./ticket.utils";

export type TicketValidation = {
  itemsTotal: number;
  expectedTotal?: number;
  difference: number;
  hasDifference: boolean;
};

export function validateTicketTotal(items: TicketItem[], expectedTotal?: number): TicketValidation {
  const itemsTotal = getItemsTotal(items);
  const difference = expectedTotal === undefined ? 0 : roundMoney(expectedTotal - itemsTotal);

  return {
    itemsTotal,
    expectedTotal,
    difference,
    hasDifference: Math.abs(difference) >= 0.01,
  };
}
