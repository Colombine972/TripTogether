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

type UpdateExpensePayload = {
  expenseId: number;
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

type ExpenseTripRow = {
  id: number;
  trip_id: number;
};

class ExpenseRepository {
  async create(
    payload: CreateExpensePayload,
  ): Promise<number> {
    const [result] =
      await databaseClient.query<Result>(
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


  async findById(
    expenseId: number,
  ): Promise<ExpenseTripRow | null> {
    const [rows] =
      await databaseClient.query<Rows>(
        `
          SELECT
            id,
            trip_id
          FROM expense
          WHERE id = ?
          LIMIT 1
        `,
        [expenseId],
      );

    const expense = rows[0];

    if (!expense) {
      return null;
    }

    return {
      id: Number(expense.id),
      trip_id: Number(expense.trip_id),
    };
  }

  async update(
    payload: UpdateExpensePayload,
  ): Promise<number> {
    const [result] =
      await databaseClient.query<Result>(
        `
          UPDATE expense
          SET
            title = ?,
            emoji = ?,
            amount = ?,
            original_amount = ?,
            original_currency = ?,
            converted_amount = ?,
            converted_currency = ?,
            exchange_rate = ?,
            paid_by = ?,
            category_id = ?,
            date = ?
          WHERE id = ?
        `,
        [
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
          payload.expenseId,
        ],
      );

    return result.affectedRows;
  }

  async findByTrip(
    tripId: number,
  ) {
    const [expenses] =
      await databaseClient.query<Rows>(
        `
          SELECT
            e.*,
            ec.name AS category_name,
            u.firstname AS paid_by_name
          FROM expense e
          JOIN expense_category ec
            ON ec.id = e.category_id
          JOIN user u
            ON u.id = e.paid_by
          WHERE e.trip_id = ?
          ORDER BY
            e.date DESC,
            e.created_at DESC
        `,
        [tripId],
      );

    const expensesWithParticipants =
      await Promise.all(
        expenses.map(
          async (expense) => {
            const [participants] =
              await databaseClient.query<Rows>(
                `
                  SELECT
                    es.user_id,
                    es.share_amount,
                    es.split_type,
                    u.firstname
                  FROM expense_share es
                  JOIN user u
                    ON u.id = es.user_id
                  WHERE es.expense_id = ?
                `,
                [expense.id],
              );

            return {
              ...expense,
              participants,
            };
          },
        ),
      );

    return expensesWithParticipants;
  }

  async sumTotalByTrip(
    tripId: number,
  ): Promise<number> {
    const [rows] =
      await databaseClient.query<Rows>(
        `
          SELECT
            SUM(converted_amount) AS total
          FROM expense
          WHERE trip_id = ?
        `,
        [tripId],
      );

    return Number(
      rows[0]?.total || 0,
    );
  }


  async sumPaidByUser(
    tripId: number,
    userId: number,
  ): Promise<number> {
    const [rows] =
      await databaseClient.query<Rows>(
        `
          SELECT
            SUM(converted_amount) AS total
          FROM expense
          WHERE
            trip_id = ?
            AND paid_by = ?
        `,
        [
          tripId,
          userId,
        ],
      );

    return Number(
      rows[0]?.total || 0,
    );
  }


  async delete(
    expenseId: number,
  ): Promise<void> {
    await databaseClient.query(
      `
        DELETE FROM expense
        WHERE id = ?
      `,
      [expenseId],
    );
  }
}

export default new ExpenseRepository();