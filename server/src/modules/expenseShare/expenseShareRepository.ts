import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

class ExpenseShareRepository {
  async create(
    expenseId: number,
    userId: number,
    shareAmount: number,
    splitType: "equal" | "exact" = "equal",
  ) {
    const [result] = await databaseClient.query<Result>(
      `
      INSERT INTO expense_share (
        expense_id,
        user_id,
        share_amount,
        split_type
      )
      VALUES (?, ?, ?, ?)
      `,
      [expenseId, userId, shareAmount, splitType],
    );

    return result.insertId;
  }

  async deleteByExpense(expenseId: number) {
    await databaseClient.query(
      `
    DELETE FROM expense_share
    WHERE expense_id = ?
    `,
      [expenseId],
    );
  }

  async sumSharesByUser(tripId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT SUM(es.share_amount) as total
      FROM expense_share es
      JOIN expense e ON e.id = es.expense_id
      WHERE e.trip_id = ? AND es.user_id = ?
      `,
      [tripId, userId],
    );

    return Number(rows[0]?.total || 0);
  }
}

export default new ExpenseShareRepository();
