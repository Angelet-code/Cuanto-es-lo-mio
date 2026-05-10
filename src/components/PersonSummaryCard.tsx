import type { Diner } from "../features/diners/diners.types";
import { getDinerItems } from "../features/diners/diners.utils";
import type { TicketItem } from "../features/ticket/ticket.types";
import { MoneyAmount } from "./MoneyAmount";

type PersonSummaryCardProps = {
  diner: Diner;
  items: TicketItem[];
};

export function PersonSummaryCard({ diner, items }: PersonSummaryCardProps) {
  const dinerItems = getDinerItems(diner, items);

  return (
    <article className="summary-card">
      <div className="summary-card__header">
        <strong>{diner.name}</strong>
        <MoneyAmount value={diner.total} tone="strong" />
      </div>
      <ul>
        {dinerItems.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <MoneyAmount value={item.totalPrice} />
          </li>
        ))}
      </ul>
    </article>
  );
}
