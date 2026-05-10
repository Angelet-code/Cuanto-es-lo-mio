import { create } from "zustand";
import type { Diner } from "../diners/diners.types";
import { buildDiner } from "../diners/diners.utils";
import type { Ticket } from "../ticket/ticket.types";
import { createTicketItem, createTicketItemsFromDraft } from "../ticket/ticket.utils";
import type { TicketExtractionResult } from "../extraction/extraction.types";

type AppStep = "capture" | "processing" | "review" | "split" | "summary";

type AppState = {
  step: AppStep;
  ticket?: Ticket;
  diners: Diner[];
  currentSelection: string[];
  currentDinerNumber: number;
  setStep: (step: AppStep) => void;
  setTicketFromExtraction: (result: TicketExtractionResult, imageUrl?: string) => void;
  confirmTotal: (total: number) => void;
  updateItem: (id: string, updates: { name?: string; quantity?: number; totalPrice?: number }) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  toggleCurrentSelection: (id: string) => void;
  saveCurrentDiner: () => void;
  resetCurrentSelection: () => void;
  resetApp: () => void;
};

const initialState = {
  step: "capture" as AppStep,
  ticket: undefined,
  diners: [],
  currentSelection: [],
  currentDinerNumber: 1,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setTicketFromExtraction: (result, imageUrl) =>
    set({
      step: "review",
      ticket: {
        id: crypto.randomUUID(),
        imageUrl,
        restaurantName: result.restaurantName,
        detectedTotal: result.detectedTotal,
        confirmedTotal: result.detectedTotal,
        items: result.items.flatMap(createTicketItemsFromDraft),
      },
      diners: [],
      currentSelection: [],
      currentDinerNumber: 1,
    }),
  confirmTotal: (total) =>
    set((state) => ({
      ticket: state.ticket ? { ...state.ticket, confirmedTotal: total } : state.ticket,
      step: "split",
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      ticket: state.ticket
        ? {
            ...state.ticket,
            items: state.ticket.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          }
        : state.ticket,
    })),
  addItem: () =>
    set((state) => ({
      ticket: state.ticket
        ? {
            ...state.ticket,
            items: [
              ...state.ticket.items,
              createTicketItem({ name: "Nuevo producto", quantity: 1, totalPrice: 0 }),
            ],
          }
        : state.ticket,
    })),
  removeItem: (id) =>
    set((state) => ({
      ticket: state.ticket
        ? {
            ...state.ticket,
            items: state.ticket.items.filter((item) => item.id !== id),
          }
        : state.ticket,
      currentSelection: state.currentSelection.filter((itemId) => itemId !== id),
    })),
  toggleCurrentSelection: (id) =>
    set((state) => {
      const item = state.ticket?.items.find((ticketItem) => ticketItem.id === id);

      if (!item || item.isAssigned || item.excludedFromTotal) {
        return state;
      }

      return {
        currentSelection: state.currentSelection.includes(id)
          ? state.currentSelection.filter((itemId) => itemId !== id)
          : [...state.currentSelection, id],
      };
    }),
  saveCurrentDiner: () =>
    set((state) => {
      if (!state.ticket || state.currentSelection.length === 0) {
        return state;
      }

      const diner = buildDiner(`Comensal ${state.currentDinerNumber}`, state.currentSelection, state.ticket.items);
      const assignedIds = new Set(state.currentSelection);
      const items = state.ticket.items.map((item) =>
        assignedIds.has(item.id) ? { ...item, assignedTo: diner.id, isAssigned: true } : item,
      );
      const hasUnassigned = items.some((item) => !item.isAssigned && !item.excludedFromTotal);

      return {
        ticket: { ...state.ticket, items },
        diners: [...state.diners, diner],
        currentSelection: [],
        currentDinerNumber: state.currentDinerNumber + 1,
        step: hasUnassigned ? "split" : "summary",
      };
    }),
  resetCurrentSelection: () => set({ currentSelection: [] }),
  resetApp: () => set(initialState),
}));
