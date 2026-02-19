import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type ExpenseShare = {
  user_id: number;
  firstname: string;
  share_amount: number;
};

type Expense = {
  id: number;
  trip_id: number;
  title: string;
  amount: number;
  date: string;
  paid_by: number;
  paid_by_name?: string;
  category_name?: string;
  shares?: ExpenseShare[];
};

class BudgetRepository {
  async findExpenseByTrip(tripId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM expense where  trip_id = ?",
      [tripId],
    );
    return rows as Expense[];
  }

  async findByTrip(tripId: number) {
    const [rows] = await databaseClient.query(
      `
    SELECT 
  e.*,
  ec.name AS category_name,
  u.firstname AS paid_by_name
FROM expense e
JOIN expense_category ec ON ec.id = e.category_id
JOIN user u ON u.id = e.paid_by
WHERE e.trip_id = ?
ORDER BY e.id DESC
    `,
      [tripId],
    );

    const expenses = rows as Expense[];

    for (const expense of expenses) {
      const shares = await this.findSharesByExpense(expense.id);
      expense.shares = shares;
    }

    return expenses;
  }

  async findSharesByExpense(expenseId: number) {
    const [rows] = await databaseClient.query(
      `
    SELECT 
      es.user_id,
      u.firstname,
      es.share_amount
    FROM expense_share es
    JOIN user u ON u.id = es.user_id
    WHERE es.expense_id = ?
    `,
      [expenseId],
    );

    return rows as ExpenseShare[];
  }

  async create(
    tripId: number,
    title: string,
    amount: number,
    paid_by: number,
    category_id: number,
  ) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO expense (trip_id, title, amount, paid_by, category_id) VALUES (?, ?, ?, ?, ?)",
      [tripId, title, amount, paid_by, category_id],
    );
    return result.insertId;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from expense");

    return rows as Expense[];
  }

  async sumTotalByTrip(tripId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT SUM(amount) as total FROM expense WHERE trip_id = ?",
      [tripId],
    );

    return Number(rows[0]?.total || 0);
  }

  async sumPaidByUser(tripId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT SUM(amount) as total FROM expense WHERE trip_id = ? AND paid_by = ?",
      [tripId, userId],
    );

    return Number(rows[0]?.total || 0);
  }

  async delete(expenseId: number) {
    await databaseClient.query("DELETE FROM expense WHERE id = ?", [expenseId]);
  }
}

export default new BudgetRepository();
