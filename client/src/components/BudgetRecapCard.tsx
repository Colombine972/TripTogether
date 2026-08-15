import {
  ArrowRight,
  CircleDollarSign,
  Coins,
  WalletCards,
} from "lucide-react";

import "../pages/styles/BudgetRecapCard.css";

type BudgetRecapCardProps = {
  totalExpenses: number;
  amountPaid: number;
  personalShare: number;
  netBalance: number;
  currency?: string;
  onOpenBudget: () => void;
};

function BudgetRecapCard({
  totalExpenses,
  amountPaid,
  netBalance,
  currency = "EUR",
  onOpenBudget,
}: BudgetRecapCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const balanceIsPositive = netBalance > 0.009;
  const balanceIsNegative = netBalance < -0.009;

  const balanceLabel = balanceIsPositive
    ? "À recevoir"
    : balanceIsNegative
      ? "À rembourser"
      : "Équilibré";

  const displayedBalance = Math.abs(netBalance);

  return (
    <article className="budget-recap-card">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="budget-recap-header">
        <div className="budget-recap-heading">
          <span className="budget-recap-main-icon">
            <WalletCards
              size={19}
              strokeWidth={2}
            />
          </span>

          <h2>Budget du voyage</h2>
        </div>

        <button
          type="button"
          className="budget-recap-link"
          onClick={onOpenBudget}
        >
          Voir le budget

          <ArrowRight
            size={15}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* =====================================================
          RÉSUMÉ
      ====================================================== */}

      <div className="budget-recap-summary">
        {/* TOTAL */}

        <div className="budget-recap-stat-card">
          <div className="budget-recap-stat-content">
            <span className="budget-recap-stat-label">
              Total dépensé
            </span>

            <strong className="budget-recap-stat-value">
              {formatCurrency(totalExpenses)}
            </strong>
          </div>

          <span className="budget-recap-stat-icon is-total">
            <Coins
              size={20}
              strokeWidth={2}
            />
          </span>
        </div>

        {/* J'AI PAYÉ */}

        <div className="budget-recap-stat-card">
          <div className="budget-recap-stat-content">
            <span className="budget-recap-stat-label">
              J'ai payé
            </span>

            <strong className="budget-recap-stat-value">
              {formatCurrency(amountPaid)}
            </strong>
          </div>

          <span className="budget-recap-stat-icon is-paid">
            <WalletCards
              size={20}
              strokeWidth={2}
            />
          </span>
        </div>

        {/* SOLDE */}

        <div
          className={`budget-recap-stat-card budget-recap-balance ${
            balanceIsPositive
              ? "is-positive"
              : balanceIsNegative
                ? "is-negative"
                : "is-settled"
          }`}
        >
          <div className="budget-recap-stat-content">
            <span className="budget-recap-stat-label">
              Mon solde
            </span>

            <div className="budget-recap-balance-value">
              <span>
                {balanceLabel}
              </span>

              <strong>
                {balanceIsPositive && "+"}
                {formatCurrency(displayedBalance)}
              </strong>
            </div>
          </div>

          <span className="budget-recap-stat-icon">
            <CircleDollarSign
              size={20}
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

export default BudgetRecapCard;