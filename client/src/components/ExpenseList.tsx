import "../pages/styles/ExpenseList.css";

type Expense = {
  id: number;
  title: string;
  emoji?: string | null;
  amount?: number;
  converted_amount?: number | null;
  converted_currency?: string | null;
  date: string;
  paid_by_name: string;
};

type ExpenseListProps = {
  expenses: Expense[];
};

function formatCurrency(amount: number, currency?: string | null) {
  const safeCurrency = currency || "EUR";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: safeCurrency,
  }).format(Number(amount || 0));
}

function groupExpensesByDate(expenses: Expense[]) {
  return expenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    const dateKey = new Date(expense.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);

    return acc;
  }, {});
}

function ExpenseList({ expenses }: ExpenseListProps) {
  const groupedExpenses = groupExpensesByDate(expenses);

  return (
    <article className="expenses-article">
      <h3>Dépenses ({expenses.length})</h3>

      {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
        <section key={date} className="expense-date-group">
          <h4>{date}</h4>

          <ul>
            {dateExpenses.map((expense) => {
              const amount =
                expense.converted_amount ?? expense.amount ?? 0;

              const currency = expense.converted_currency || "EUR";

              return (
                <li key={expense.id} className="expense-item">
                  <div className="left-side">
                    <span className="expense-emoji">
                      {expense.emoji || "💸"}
                    </span>

                    <div>
                      <p className="expense-title">{expense.title}</p>
                      <p className="expense-paid-by">
                        Payé par {expense.paid_by_name}
                      </p>
                    </div>
                  </div>

                  <div className="right-side">
                    <p className="expense-amount">
                      {formatCurrency(amount, currency)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </article>
  );
}

export default ExpenseList;