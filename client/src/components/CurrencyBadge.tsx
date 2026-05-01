import { Banknote } from "lucide-react";
import "../pages/styles/CurrencyBadge.css";

type CurrencyBadgeProps = {
  currencyCode?: string | null;
};

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  JPY: "¥",
  CHF: "Fr",
  CAD: "$",
  AUD: "$",
  CNY: "¥",
  INR: "₹",
  KRW: "₩",
  TRY: "₺",
  BRL: "R$",
  MAD: "د.م.",
};

function CurrencyBadge({ currencyCode }: CurrencyBadgeProps) {
  if (!currencyCode) return null;

  const normalizedCurrency = currencyCode.toUpperCase();
  const symbol = currencySymbols[normalizedCurrency];

  return (
    <span className="currency-badge">
      {symbol ? (
        <span className="currency-badge-symbol">{symbol}</span>
      ) : (
        <Banknote size={18} strokeWidth={2.2} />
      )}

      <span>{normalizedCurrency}</span>
    </span>
  );
}

export default CurrencyBadge;