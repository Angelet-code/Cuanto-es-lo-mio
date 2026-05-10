import { Camera, Check } from "lucide-react";
import { MoneyAmount } from "../components/MoneyAmount";
import { useAppStore } from "../features/app/app.store";
import { roundMoney } from "../services/currency.service";

export function SelectItemsPage() {
  const ticket = useAppStore((state) => state.ticket);
  const currentSelection = useAppStore((state) => state.currentSelection);
  const toggleCurrentSelection = useAppStore((state) => state.toggleCurrentSelection);
  const saveCurrentDiner = useAppStore((state) => state.saveCurrentDiner);
  const resetApp = useAppStore((state) => state.resetApp);

  if (!ticket) {
    return null;
  }

  const selectedTotal = roundMoney(
    ticket.items
      .filter((item) => currentSelection.includes(item.id) && !item.excludedFromTotal)
      .reduce((total, item) => total + item.totalPrice, 0),
  );
  const remainingAfterSave = ticket.items.filter(
    (item) => !item.isAssigned && !item.excludedFromTotal && !currentSelection.includes(item.id),
  );
  const hasSelection = currentSelection.length > 0;
  const isLastSelection = hasSelection && remainingAfterSave.length === 0;

  return (
    <main className="simple-screen split-screen">
      <h1 className="screen-title">Marca lo tuyo</h1>

      <section className="choice-list" aria-label="Productos del ticket">
        {ticket.items.map((item) => {
          const selected = currentSelection.includes(item.id);

          return (
            <button
              key={item.id}
              className={`choice-row choice-row--${item.readStatus ?? "sure"} ${selected ? "is-selected" : ""} ${
                item.isAssigned ? "is-assigned" : ""
              } ${item.excludedFromTotal ? "is-excluded" : ""}`}
              type="button"
              disabled={item.isAssigned || item.excludedFromTotal}
              onClick={() => toggleCurrentSelection(item.id)}
              title={item.readReason}
            >
              <span className="choice-check" aria-hidden="true">{selected && <Check size={17} />}</span>
              <span className="choice-copy">
                <span className="choice-name">{item.name}</span>
                {item.readReason && <small>{item.readReason}</small>}
              </span>
              <MoneyAmount value={item.totalPrice} />
            </button>
          );
        })}
      </section>

      <section className="your-total">
        <span>Lo tuyo es:</span>
        <strong>
          <MoneyAmount value={selectedTotal} />
        </strong>
      </section>

      <button className="bottom-button" type="button" onClick={saveCurrentDiner} disabled={!hasSelection}>
        {isLastSelection ? "Terminar" : "Siguiente"}
      </button>
      <button className="secondary-bottom-button" type="button" onClick={resetApp}>
        <Camera size={18} />
        Escanear otro ticket
      </button>
    </main>
  );
}
