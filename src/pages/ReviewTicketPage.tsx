import { MoneyAmount } from "../components/MoneyAmount";
import { useAppStore } from "../features/app/app.store";

export function ReviewTicketPage() {
  const ticket = useAppStore((state) => state.ticket);
  const confirmTotal = useAppStore((state) => state.confirmTotal);
  const setStep = useAppStore((state) => state.setStep);

  if (!ticket) {
    return null;
  }

  const total = ticket.detectedTotal ?? ticket.confirmedTotal ?? 0;

  return (
    <main className="simple-screen simple-screen--center">
      <section className="confirm-total">
        <h1>¿Es esta la suma total?</h1>
        <p>
          <MoneyAmount value={total} tone="strong" />
        </p>
        <div className="confirm-actions">
          <button className="pill-button pill-button--primary" type="button" onClick={() => confirmTotal(total)}>
            Sí
          </button>
          <button className="pill-button" type="button" onClick={() => setStep("capture")}>
            No
          </button>
        </div>
      </section>
    </main>
  );
}
