import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type {
  CreateReimbursementPayload,
  Reimbursement,
} from "../../types/reimbursement";

class ReimbursementRepository {
  async create(payload: CreateReimbursementPayload) {
    const [result] = await databaseClient.query<Result>(
      `
      INSERT INTO reimbursement (
        trip_id,
        from_user_id,
        to_user_id,
        amount,
        currency,
        payment_method,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        payload.tripId,
        payload.fromUserId,
        payload.toUserId,
        payload.amount,
        payload.currency,
        payload.paymentMethod,
      ],
    );

    return result.insertId;
  }

  async findById(
    reimbursementId: number,
  ): Promise<Reimbursement | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT
        r.*,
        from_user.firstname AS from_firstname,
        to_user.firstname AS to_firstname
      FROM reimbursement r
      JOIN user from_user
        ON from_user.id = r.from_user_id
      JOIN user to_user
        ON to_user.id = r.to_user_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [reimbursementId],
    );

    if (!rows[0]) {
      return null;
    }

    return rows[0] as Reimbursement;
  }

  async findByTripAndUser(
    tripId: number,
    userId: number,
  ): Promise<Reimbursement[]> {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT
        r.*,
        from_user.firstname AS from_firstname,
        to_user.firstname AS to_firstname
      FROM reimbursement r
      JOIN user from_user
        ON from_user.id = r.from_user_id
      JOIN user to_user
        ON to_user.id = r.to_user_id
      WHERE
        r.trip_id = ?
        AND (
          r.from_user_id = ?
          OR r.to_user_id = ?
        )
      ORDER BY r.created_at DESC
      `,
      [tripId, userId, userId],
    );

    return rows as Reimbursement[];
  }

  async findPendingBetween(
    tripId: number,
    fromUserId: number,
    toUserId: number,
  ): Promise<Reimbursement | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT *
      FROM reimbursement
      WHERE
        trip_id = ?
        AND from_user_id = ?
        AND to_user_id = ?
        AND status = 'pending'
      LIMIT 1
      `,
      [tripId, fromUserId, toUserId],
    );

    if (!rows[0]) {
      return null;
    }

    return rows[0] as Reimbursement;
  }

  async confirm(reimbursementId: number) {
    const [result] = await databaseClient.query<Result>(
      `
      UPDATE reimbursement
      SET
        status = 'confirmed',
        confirmed_at = CURRENT_TIMESTAMP,
        rejected_at = NULL
      WHERE
        id = ?
        AND status = 'pending'
      `,
      [reimbursementId],
    );

    return result.affectedRows;
  }

  async reject(reimbursementId: number) {
    const [result] = await databaseClient.query<Result>(
      `
      UPDATE reimbursement
      SET
        status = 'rejected',
        rejected_at = CURRENT_TIMESTAMP,
        confirmed_at = NULL
      WHERE
        id = ?
        AND status = 'pending'
      `,
      [reimbursementId],
    );

    return result.affectedRows;
  }

  async getOutstandingDebtBetween(
    tripId: number,
    debtorId: number,
    creditorId: number,
  ): Promise<number> {
    /*
     * Sommes que le débiteur doit au créancier :
     * le créancier a payé et le débiteur possède une part.
     */
    const [debtorOwesRows] = await databaseClient.query<Rows>(
      `
      SELECT
        COALESCE(SUM(es.share_amount), 0) AS total
      FROM expense e
      JOIN expense_share es
        ON es.expense_id = e.id
      WHERE
        e.trip_id = ?
        AND e.paid_by = ?
        AND es.user_id = ?
      `,
      [tripId, creditorId, debtorId],
    );

    /*
     * Sommes que le créancier doit au débiteur :
     * elles sont compensées dans le solde net.
     */
    const [creditorOwesRows] = await databaseClient.query<Rows>(
      `
      SELECT
        COALESCE(SUM(es.share_amount), 0) AS total
      FROM expense e
      JOIN expense_share es
        ON es.expense_id = e.id
      WHERE
        e.trip_id = ?
        AND e.paid_by = ?
        AND es.user_id = ?
      `,
      [tripId, debtorId, creditorId],
    );

    /*
     * Remboursements déjà confirmés dans les deux sens.
     */
    const [confirmedRows] = await databaseClient.query<Rows>(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN from_user_id = ? AND to_user_id = ?
                THEN amount
              WHEN from_user_id = ? AND to_user_id = ?
                THEN -amount
              ELSE 0
            END
          ),
          0
        ) AS total
      FROM reimbursement
      WHERE
        trip_id = ?
        AND status = 'confirmed'
      `,
      [
        debtorId,
        creditorId,
        creditorId,
        debtorId,
        tripId,
      ],
    );

    const debtorOwes = Number(debtorOwesRows[0]?.total || 0);
    const creditorOwes = Number(creditorOwesRows[0]?.total || 0);
    const confirmedPayments = Number(
      confirmedRows[0]?.total || 0,
    );

    return Number(
      (
        debtorOwes -
        creditorOwes -
        confirmedPayments
      ).toFixed(2),
    );
  }
}

export default new ReimbursementRepository();