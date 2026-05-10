import { recognize } from "tesseract.js";
import type { TicketExtractionResult } from "./extraction.types";
import { parseReceiptText } from "./receipt-parser";

const mockTicket: TicketExtractionResult = {
  restaurantName: "Bar La Mesa",
  detectedTotal: 75.2,
  items: [
    { name: "Croquetas", quantity: 1, unitPrice: 8.5, totalPrice: 8.5 },
    { name: "Cerveza", quantity: 4, unitPrice: 3.2, totalPrice: 12.8 },
    { name: "Ensaladilla", quantity: 1, unitPrice: 8.8, totalPrice: 8.8 },
    { name: "Pan", quantity: 2, unitPrice: 1.8, totalPrice: 3.6 },
    { name: "Patatas bravas", quantity: 1, unitPrice: 7.5, totalPrice: 7.5 },
    { name: "Tinto de verano", quantity: 2, unitPrice: 3.5, totalPrice: 7 },
    { name: "Calamares", quantity: 1, unitPrice: 11.2, totalPrice: 11.2 },
    { name: "Cafe", quantity: 3, unitPrice: 1.6, totalPrice: 4.8 },
    { name: "Tarta de queso", quantity: 2, unitPrice: 5.5, totalPrice: 11 },
  ],
};

export async function extractTicketFromImage(image: File): Promise<TicketExtractionResult> {
  const result = await recognize(image, "spa+eng");
  return parseReceiptText(result.data.text);
}

export async function extractDemoTicket(): Promise<TicketExtractionResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  return mockTicket;
}
