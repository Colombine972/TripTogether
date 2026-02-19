type Expense = {
  id: number;
  title: string;
  amount: number;
  created_at: string;
  paid_by: number;
  category_id: number;
};

type ExpenseListProps = {
  expenses: Expense[];
};

function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <article className="expenses-article">
      <h3>Dépenses ({expenses.length})</h3>

      <ul>
        {expenses.map((expense) => (
          <li key={expense.id} className="expense-item">
            <div className="left-side">
              <p className="expense-title">{expense.title}</p>
              <p className="expense-date">
                {new Date(expense.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="right-side">
              <p className="expense-amount">{expense.amount.toFixed(2)} €</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default ExpenseList;
