import { Camera, Copy } from "lucide-react";
import { useState } from "react";
import { MoneyAmount } from "../components/MoneyAmount";
import { useAppStore } from "../features/app/app.store";
import { formatMoney, roundMoney } from "../services/currency.service";

export function SummaryPage() {
  const diners = useAppStore((state) => state.diners);
  const resetApp = useAppStore((state) => state.resetApp);
  const [copied, setCopied] = useState(false);
  const total = roundMoney(diners.reduce((sum, diner) => sum + diner.total, 0));

  async function copySummary() {
    const text = [
      "Resumen",
      ...diners.map((diner, index) => `${index + 1} - ${formatMoney(diner.total)}`),
      `Total: ${formatMoney(total)}`,
    ].join("\n");

    await navigator.clipboard?.writeText(text);
    setCopied(true);
  }

  return (
    <main className="simple-screen summary-screen">
      <h1 className="screen-title">Resumen</h1>

      <section className="summary-simple-list">
        {diners.map((diner, index) => (
          <div className="summary-simple-row" key={diner.id}>
            <span>{index + 1}</span>
            <MoneyAmount value={diner.total} />
          </div>
        ))}
      </section>

      <div className="summary-total">
        <span>Total:</span>
        <MoneyAmount value={total} tone="strong" />
      </div>

      <button className="bottom-button" type="button" onClick={() => void copySummary()}>
        <Copy size={18} />
        {copied ? "Copiado" : "Copiar"}
      </button>
      <button className="secondary-bottom-button" type="button" onClick={resetApp}>
        <Camera size={18} />
        Escanear otro ticket
      </button>
    </main>
  );
}
