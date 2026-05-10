import { roundMoney } from "../../services/currency.service";
import type { TicketItem } from "../ticket/ticket.types";
import type { Diner } from "./diners.types";

export function buildDiner(name: string, itemIds: string[], items: TicketItem[]): Diner {
  const selectedItems = items.filter((item) => itemIds.includes(item.id) && !item.excludedFromTotal);

  return {
    id: crypto.randomUUID(),
    name,
    itemIds,
    total: roundMoney(selectedItems.reduce((total, item) => total + item.totalPrice, 0)),
  };
}

export function getDinerItems(diner: Diner, items: TicketItem[]): TicketItem[] {
  return items.filter((item) => diner.itemIds.includes(item.id));
}
