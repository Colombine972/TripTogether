import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type CreateExpensePayload = {
  tripId: number;
  title: string;
  emoji?: string;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  paidBy: number;
  categoryId: number;
  date: string;
};

class ExpenseRepository {
  async create(payload: CreateExpensePayload) {
    const [result] = await databaseClient.query<Result>(
      `
      INSERT INTO expense (
        trip_id,
        title,
        emoji,
        amount,
        original_amount,
        original_currency,
        converted_amount,
        converted_currency,
        exchange_rate,
        paid_by,
        category_id,
        date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.tripId,
        payload.title,
        payload.emoji || null,
        payload.convertedAmount,
        payload.originalAmount,
        payload.originalCurrency,
        payload.convertedAmount,
        payload.convertedCurrency,
        payload.exchangeRate,
        payload.paidBy,
        payload.categoryId,
        payload.date,
      ],
    );

    return result.insertId;
  }

  async findByTrip(tripId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT 
        e.*,
        ec.name AS category_name,
        u.firstname AS paid_by_name
      FROM expense e
      JOIN expense_category ec ON ec.id = e.category_id
      JOIN user u ON u.id = e.paid_by
      WHERE e.trip_id = ?
      ORDER BY e.date DESC, e.created_at DESC
      `,
      [tripId],
    );

    return rows;
  }

  async sumTotalByTrip(tripId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT SUM(converted_amount) as total FROM expense WHERE trip_id = ?",
      [tripId],
    );

    return Number(rows[0]?.total || 0);
  }

  async sumPaidByUser(tripId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT SUM(converted_amount) as total
      FROM expense
      WHERE trip_id = ? AND paid_by = ?
      `,
      [tripId, userId],
    );

    return Number(rows[0]?.total || 0);
  }

  async delete(expenseId: number) {
    await databaseClient.query("DELETE FROM expense WHERE id = ?", [expenseId]);
  }
}

export default new ExpenseRepository();