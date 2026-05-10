import { formatMoney } from "../services/currency.service";

type MoneyAmountProps = {
  value: number;
  tone?: "default" | "strong" | "muted";
};

export function MoneyAmount({ value, tone = "default" }: MoneyAmountProps) {
  return <span className={`money money--${tone}`}>{formatMoney(value)}</span>;
}
