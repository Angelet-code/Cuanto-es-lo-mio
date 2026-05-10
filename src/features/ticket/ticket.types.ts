export type TicketItemReadStatus = "sure" | "warning" | "error";

export type TicketItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  totalPrice: number;
  readStatus?: TicketItemReadStatus;
  readReason?: string;
  excludedFromTotal?: boolean;
  assignedTo?: string;
  isAssigned: boolean;
};

export type Ticket = {
  id: string;
  imageUrl?: string;
  restaurantName?: string;
  detectedTotal?: number;
  confirmedTotal?: number;
  items: TicketItem[];
};

export type TicketDraftItem = Omit<TicketItem, "id" | "isAssigned">;
