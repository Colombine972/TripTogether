import "../pages/styles/BudgetSummary.css";

type BudgetSummaryProps = {
  total?: number;
  paid?: number;
  balance?: number;
  expenseCount?: number;
  currency?: string | null;
};

function BudgetSummary({
  total = 0,
  paid = 0,
  balance = 0,
  expenseCount = 0,
  currency = "EUR",
}: BudgetSummaryProps) {
  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currency || "EUR",
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} €`;
    }
  };

  return (
    <section className="budget-summary">
      <div className="budget-card">
        <p className="card-label">Dépenses totales du voyage</p>
        <h3>{formatCurrency(total)}</h3>
      </div>

      <div className="budget-card">
        <p className="card-label">Mes dépenses</p>
        <h3>{formatCurrency(paid)}</h3>
      </div>

      <div
        className={`budget-card ${
          balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral"
        }`}
      >
        <p className="card-label">Mon solde</p>

        {balance > 0 && (
          <h3>🟢 On me doit {formatCurrency(balance)}</h3>
        )}

        {balance < 0 && (
          <h3>🔴 Je dois {formatCurrency(Math.abs(balance))}</h3>
        )}

        {balance === 0 && <h3>⚖️ Comptes équilibrés</h3>}
      </div>

      <div className="budget-card">
        <p className="card-label">Nombre de dépenses</p>
        <h3>{expenseCount}</h3>
      </div>
    </section>
  );
}

export default BudgetSummary;