import { receiptExtractionPrompt } from "../prompts/receipt-extraction.prompt";

export async function extractTicket(_image: File) {
  throw new Error(`Ticket extraction is not implemented yet. Prompt ready: ${receiptExtractionPrompt.length} chars.`);
}
