import { roundMoney } from "../../services/currency.service";
import type { TicketDraftItem, TicketItem } from "./ticket.types";

export function createTicketItem(item: Omit<TicketItem, "id" | "isAssigned">): TicketItem {
  return {
    ...item,
    id: crypto.randomUUID(),
    readStatus: item.readStatus ?? "sure",
    excludedFromTotal: item.excludedFromTotal ?? false,
    isAssigned: false,
  };
}

export function createTicketItemsFromDraft(item: TicketDraftItem): TicketItem[] {
  const quantity = Math.max(1, Math.trunc(item.quantity || 1));

  if (quantity === 1 || item.excludedFromTotal) {
    return [createTicketItem({ ...item, quantity: 1 })];
  }

  const unitPrice = item.unitPrice ?? roundMoney(item.totalPrice / quantity);

  return Array.from({ length: quantity }, () =>
    createTicketItem({
      name: item.name,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      readStatus: item.readStatus,
      readReason: item.readReason,
      excludedFromTotal: item.excludedFromTotal,
    }),
  );
}

export function getItemsTotal(items: TicketItem[]): number {
  return roundMoney(items.reduce((total, item) => total + (item.excludedFromTotal ? 0 : item.totalPrice), 0));
}

export function getUnassignedItems(items: TicketItem[]): TicketItem[] {
  return items.filter((item) => !item.isAssigned && !item.excludedFromTotal);
}
