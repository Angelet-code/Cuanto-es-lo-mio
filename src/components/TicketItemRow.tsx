import { Trash2 } from "lucide-react";
import type { TicketItem } from "../features/ticket/ticket.types";

type TicketItemRowProps = {
  item: TicketItem;
  editable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onUpdate?: (updates: { name?: string; quantity?: number; totalPrice?: number }) => void;
  onRemove?: () => void;
};

export function TicketItemRow({ item, editable, selected, onToggle, onUpdate, onRemove }: TicketItemRowProps) {
  if (!editable) {
    return (
      <button
        className={`item-row item-row--button ${selected ? "is-selected" : ""} ${item.isAssigned ? "is-assigned" : ""}`}
        type="button"
        onClick={onToggle}
        disabled={item.isAssigned}
      >
        <span>
          <strong>{item.name}</strong>
          <small>Cantidad {item.quantity}</small>
        </span>
        <strong>{item.totalPrice.toFixed(2).replace(".", ",")} EUR</strong>
      </button>
    );
  }

  return (
    <div className="item-row item-row--editable">
      <input
        aria-label="Nombre del producto"
        value={item.name}
        onChange={(event) => onUpdate?.({ name: event.target.value })}
      />
      <input
        aria-label="Cantidad"
        inputMode="numeric"
        value={item.quantity}
        onChange={(event) => onUpdate?.({ quantity: Number(event.target.value) || 1 })}
      />
      <input
        aria-label="Precio"
        inputMode="decimal"
        value={String(item.totalPrice).replace(".", ",")}
        onChange={(event) => onUpdate?.({ totalPrice: Number(event.target.value.replace(",", ".")) || 0 })}
      />
      <button className="icon-button" type="button" aria-label="Eliminar producto" onClick={onRemove}>
        <Trash2 size={18} />
      </button>
    </div>
  );
}
