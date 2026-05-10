import { extractTicket } from "../services/ticket-extraction.service";

export async function handleExtractTicket(image: File) {
  return extractTicket(image);
}
