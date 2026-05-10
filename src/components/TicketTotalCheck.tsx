import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { MoneyAmount } from "./MoneyAmount";

type TicketTotalCheckProps = {
  detectedTotal?: number;
  onConfirm: (total: number) => void;
  onRetake: () => void;
};

export function TicketTotalCheck({ detectedTotal = 0, onConfirm, onRetake }: TicketTotalCheckProps) {
  const [manualTotal, setManualTotal] = useState(String(detectedTotal.toFixed(2)).replace(".", ","));

  return (
    <section className="total-check">
      <p className="eyebrow">Total detectado</p>
      <h2>
        Suma <MoneyAmount value={detectedTotal} tone="strong" />?
      </h2>
      <label className="field">
        Total confirmado
        <input inputMode="decimal" value={manualTotal} onChange={(event) => setManualTotal(event.target.value)} />
      </label>
      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onRetake}>
          <RotateCcw size={19} />
          Repetir
        </button>
        <button className="primary-button" type="button" onClick={() => onConfirm(Number(manualTotal.replace(",", ".")))}>
          <Check size={19} />
          Continuar
        </button>
      </div>
    </section>
  );
}
