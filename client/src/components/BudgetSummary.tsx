import "../pages/styles/BudgetSummary.css";

type BudgetSummaryProps = {
  total: number;
  paid: number;
  balance: number;
};

function BudgetSummary({ total, paid, balance }: BudgetSummaryProps) {
  return (
    <section className="budget-summary">
      <div className="budget-card">
        <p className="card-label">Dépenses totales du voyage</p>
        <h3>{Number(total ?? 0).toFixed(2)} €</h3>
      </div>

      <div className="budget-card">
        <p className="card-label">Tu as payé</p>
        <h3>{Number(paid ?? 0).toFixed(2)} €</h3>
      </div>

      <div
        className={`budget-card ${
          balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral"
        }`}
      >
        <p className="card-label">Ton solde</p>

        {balance > 0 && <h3>On te doit {Number(balance).toFixed(2)} €</h3>}

        {balance < 0 && (
          <h3>Tu dois {Number(Math.abs(balance)).toFixed(2)} €</h3>
        )}

        {balance === 0 && <h3>⚖️ - €</h3>}
      </div>
    </section>
  );
}

export default BudgetSummary;
