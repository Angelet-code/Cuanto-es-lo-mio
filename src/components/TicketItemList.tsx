import { Plus } from "lucide-react";
import type { TicketItem } from "../features/ticket/ticket.types";
import { TicketItemRow } from "./TicketItemRow";

type TicketItemListProps = {
  items: TicketItem[];
  onAdd: () => void;
  onUpdate: (id: string, updates: { name?: string; quantity?: number; totalPrice?: number }) => void;
  onRemove: (id: string) => void;
};

export function TicketItemList({ items, onAdd, onUpdate, onRemove }: TicketItemListProps) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Conceptos</p>
          <h2>Lista editable</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Anadir producto" onClick={onAdd}>
          <Plus size={20} />
        </button>
      </div>

      <div className="editable-list">
        {items.map((item) => (
          <TicketItemRow
            key={item.id}
            item={item}
            editable
            onUpdate={(updates) => onUpdate(item.id, updates)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
