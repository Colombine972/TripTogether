type ParticipantBalance = {
  userId: number;
  firstname: string;
  amountToReceive: number;
  amountToPay: number;
  netBalance: number;
};

type RemboursementSummaryProps = {
  balances: ParticipantBalance[];
  currency: string;
};

function RemboursementSummary({
  balances,
  currency,
}: RemboursementSummaryProps) {
  const safeCurrency = (currency || "EUR").toUpperCase();

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: safeCurrency,
      }).format(Math.abs(amount));
    } catch {
      return `${Math.abs(amount).toFixed(2)} ${safeCurrency}`;
    }
  };

  const totalToReceive = balances.reduce(
    (total, balance) =>
      balance.netBalance > 0 ? total + balance.netBalance : total,
    0,
  );

  const totalToPay = balances.reduce(
    (total, balance) =>
      balance.netBalance < 0 ? total + Math.abs(balance.netBalance) : total,
    0,
  );

  const globalNetBalance = Number((totalToReceive - totalToPay).toFixed(2));

  return (
    <section className="reimbursement-summary">
      <div className="reimbursement-summary-header">
        <div>
          <h3>⚖️ Mes soldes avec les participants</h3>

          <p>
            Les montants dus et à recevoir sont compensés pour afficher votre
            solde réel avec chaque participant.
          </p>
        </div>

        {balances.length > 0 && (
          <div className="participant-balances-totals">
            <div className="participant-balances-total positive">
              <span>À recevoir</span>

              <strong>{formatCurrency(totalToReceive)}</strong>
            </div>

            <div className="participant-balances-total negative">
              <span>À rembourser</span>

              <strong>{formatCurrency(totalToPay)}</strong>
            </div>

            <div
              className={`participant-balances-total net ${
                globalNetBalance >= 0 ? "positive" : "negative"
              }`}
            >
              <span>Solde net</span>

              <strong>
                {globalNetBalance >= 0 ? "+" : "−"}
                {formatCurrency(globalNetBalance)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {balances.length === 0 ? (
        <div className="reimbursement-summary-empty">
          <p>Tous vos comptes sont équilibrés avec les participants.</p>
        </div>
      ) : (
        <div className="reimbursement-summary-list">
          {balances.map((balance) => {
            const participantOwesUser = balance.netBalance > 0;

            return (
              <article
                key={balance.userId}
                className={`reimbursement-summary-card ${
                  participantOwesUser ? "balance-positive" : "balance-negative"
                }`}
              >
                <div className="reimbursement-summary-person">
                  <div className="reimbursement-summary-avatar">
                    {balance.firstname.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h4>{balance.firstname}</h4>

                    <p>
                      {participantOwesUser
                        ? "Cette personne vous doit"
                        : "Vous devez à cette personne"}
                    </p>
                  </div>
                </div>

                <div className="participant-net-balance">
                  <span
                    className={`participant-balance-status ${
                      participantOwesUser ? "positive" : "negative"
                    }`}
                  >
                    {participantOwesUser ? "À recevoir" : "À rembourser"}
                  </span>

                  <strong>{formatCurrency(balance.netBalance)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RemboursementSummary;
