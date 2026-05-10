import type { TicketDraftItem } from "../ticket/ticket.types";

export type TicketExtractionResult = {
  restaurantName?: string;
  detectedTotal?: number;
  items: TicketDraftItem[];
  warnings?: string[];
};
