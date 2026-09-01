import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

import type {
  CreateReimbursementPayload,
  Reimbursement,
  ReimbursementExpenseAllocation,
} from "../../types/reimbursement";

class ReimbursementRepository {
  /* =========================================================
     CRÉER UN REMBOURSEMENT
  ========================================================= */

  async create(payload: CreateReimbursementPayload): Promise<number> {
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

  /* =========================================================
     TROUVER UN REMBOURSEMENT
  ========================================================= */

  async findById(reimbursementId: number): Promise<Reimbursement | null> {
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

  /* =========================================================
     REMBOURSEMENTS D'UN UTILISATEUR POUR UN VOYAGE
  ========================================================= */

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

  /* =========================================================
     REMBOURSEMENT EN ATTENTE ENTRE DEUX PERSONNES
  ========================================================= */

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

  /* =========================================================
     CONFIRMER
  ========================================================= */

  async confirm(reimbursementId: number): Promise<number> {
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

  /* =========================================================
     REFUSER
  ========================================================= */

  async reject(reimbursementId: number): Promise<number> {
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

  /* =========================================================
   SUPPRIMER LES ALLOCATIONS D'UN REMBOURSEMENT
========================================================= */

  async deleteExpenseAllocations(reimbursementId: number): Promise<void> {
    await databaseClient.query(
      `
      DELETE FROM reimbursement_expense
      WHERE reimbursement_id = ?
    `,
      [reimbursementId],
    );
  }

  /* =========================================================
     CALCULER LA DETTE NETTE
  ========================================================= */

  async getOutstandingDebtBetween(
    tripId: number,
    debtorId: number,
    creditorId: number,
  ): Promise<number> {
    /*
     * Le créancier a payé.
     * Le débiteur possède une part.
     */

    const [debtorOwesRows] = await databaseClient.query<Rows>(
      `
          SELECT
            COALESCE(
              SUM(es.share_amount),
              0
            ) AS total

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
     * Dette dans le sens inverse.
     */

    const [creditorOwesRows] = await databaseClient.query<Rows>(
      `
          SELECT
            COALESCE(
              SUM(es.share_amount),
              0
            ) AS total

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
     * Remboursements confirmés dans les deux sens.
     */

    const [confirmedRows] = await databaseClient.query<Rows>(
      `
          SELECT
            COALESCE(
              SUM(
                CASE

                  WHEN
                    from_user_id = ?
                    AND to_user_id = ?
                  THEN amount

                  WHEN
                    from_user_id = ?
                    AND to_user_id = ?
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

    const confirmedPayments = Number(confirmedRows[0]?.total || 0);

    return Number((debtorOwes - creditorOwes - confirmedPayments).toFixed(2));
  }

  /* =========================================================
     DÉPENSES CONCERNÉES PAR UN REMBOURSEMENT
  ========================================================= */

  async getExpenseAllocationsForReimbursement(
    tripId: number,
    debtorId: number,
    creditorId: number,
    reimbursementAmount: number,
  ): Promise<ReimbursementExpenseAllocation[]> {
    /*
     * Dépenses pour lesquelles :
     *
     * - le créancier a payé ;
     * - le débiteur possède une part.
     *
     * Elles AUGMENTENT la dette.
     */

    const [debtRows] = await databaseClient.query<Rows>(
      `
          SELECT
            e.id AS expense_id,
            e.date,
            e.created_at,
            es.share_amount

          FROM expense e

          JOIN expense_share es
            ON es.expense_id = e.id

          WHERE
            e.trip_id = ?
            AND e.paid_by = ?
            AND es.user_id = ?

          ORDER BY
            e.date ASC,
            e.created_at ASC,
            e.id ASC
        `,
      [tripId, creditorId, debtorId],
    );

    /*
     * Dépenses dans le sens inverse :
     *
     * le débiteur a payé et le créancier
     * possède une part.
     *
     * Elles DIMINUENT la dette nette.
     */

    const [offsetRows] = await databaseClient.query<Rows>(
      `
          SELECT
            e.id AS expense_id,
            e.date,
            e.created_at,
            es.share_amount

          FROM expense e

          JOIN expense_share es
            ON es.expense_id = e.id

          WHERE
            e.trip_id = ?
            AND e.paid_by = ?
            AND es.user_id = ?

          ORDER BY
            e.date ASC,
            e.created_at ASC,
            e.id ASC
        `,
      [tripId, debtorId, creditorId],
    );

    /*
     * Les allocations de remboursements déjà
     * confirmés ne doivent pas être réutilisées.
     */

    const [usedDebtRows] = await databaseClient.query<Rows>(
      `
          SELECT
            re.expense_id,

            COALESCE(
              SUM(re.allocated_amount),
              0
            ) AS allocated

          FROM reimbursement_expense re

          JOIN reimbursement r
            ON r.id = re.reimbursement_id

          WHERE
            r.trip_id = ?
            AND r.from_user_id = ?
            AND r.to_user_id = ?
            AND r.status IN (
              'pending',
              'confirmed'
            )
            AND re.allocation_type = 'debt'

          GROUP BY re.expense_id
        `,
      [tripId, debtorId, creditorId],
    );

    const [usedOffsetRows] = await databaseClient.query<Rows>(
      `
          SELECT
            re.expense_id,

            COALESCE(
              SUM(re.allocated_amount),
              0
            ) AS allocated

          FROM reimbursement_expense re

          JOIN reimbursement r
            ON r.id = re.reimbursement_id

          WHERE
            r.trip_id = ?
            AND r.from_user_id = ?
            AND r.to_user_id = ?
            AND r.status IN (
              'pending',
              'confirmed'
            )
            AND re.allocation_type = 'offset'

          GROUP BY re.expense_id
        `,
      [tripId, debtorId, creditorId],
    );

    const usedDebt = new Map<number, number>();

    for (const row of usedDebtRows) {
      usedDebt.set(Number(row.expense_id), Number(row.allocated || 0));
    }

    const usedOffset = new Map<number, number>();

    for (const row of usedOffsetRows) {
      usedOffset.set(Number(row.expense_id), Number(row.allocated || 0));
    }

    /*
     * Montants encore disponibles.
     */

    const availableDebt = debtRows
      .map((row) => {
        const expenseId = Number(row.expense_id);

        const share = Number(row.share_amount);

        const alreadyAllocated = usedDebt.get(expenseId) || 0;

        return {
          expenseId,

          amount: Number(Math.max(0, share - alreadyAllocated).toFixed(2)),
        };
      })
      .filter((item) => item.amount > 0.001);

    const availableOffset = offsetRows
      .map((row) => {
        const expenseId = Number(row.expense_id);

        const share = Number(row.share_amount);

        const alreadyAllocated = usedOffset.get(expenseId) || 0;

        return {
          expenseId,

          amount: Number(Math.max(0, share - alreadyAllocated).toFixed(2)),
        };
      })
      .filter((item) => item.amount > 0.001);

    /*
     * Calcul de la compensation disponible.
     */

    const totalOffset = availableOffset.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    /*
     * Pour couvrir un remboursement de 60 €
     * avec 40 € de compensation inverse,
     * il faut rattacher 100 € de dette :
     *
     * 100 - 40 = 60.
     */

    let debtToAllocate = Number((reimbursementAmount + totalOffset).toFixed(2));

    const allocations: ReimbursementExpenseAllocation[] = [];

    /* =====================================================
       ALLOCATION DES DETTES
    ====================================================== */

    for (const item of availableDebt) {
      if (debtToAllocate <= 0.001) {
        break;
      }

      const allocatedAmount = Number(
        Math.min(item.amount, debtToAllocate).toFixed(2),
      );

      if (allocatedAmount <= 0) {
        continue;
      }

      allocations.push({
        expenseId: item.expenseId,

        amount: allocatedAmount,

        type: "debt",
      });

      debtToAllocate = Number((debtToAllocate - allocatedAmount).toFixed(2));
    }

    /*
     * Si toutes les compensations ne sont
     * pas nécessaires, on n'enregistre
     * que la quantité réellement utilisée.
     */

    const allocatedDebtTotal = allocations
      .filter((allocation) => allocation.type === "debt")
      .reduce((sum, allocation) => sum + allocation.amount, 0);

    let offsetToAllocate = Number(
      Math.max(0, allocatedDebtTotal - reimbursementAmount).toFixed(2),
    );

    /* =====================================================
       ALLOCATION DES COMPENSATIONS
    ====================================================== */

    for (const item of availableOffset) {
      if (offsetToAllocate <= 0.001) {
        break;
      }

      const allocatedAmount = Number(
        Math.min(item.amount, offsetToAllocate).toFixed(2),
      );

      if (allocatedAmount <= 0) {
        continue;
      }

      allocations.push({
        expenseId: item.expenseId,

        amount: allocatedAmount,

        type: "offset",
      });

      offsetToAllocate = Number(
        (offsetToAllocate - allocatedAmount).toFixed(2),
      );
    }

    const debtTotal = allocations
      .filter((allocation) => allocation.type === "debt")
      .reduce((sum, allocation) => sum + allocation.amount, 0);

    const offsetTotal = allocations
      .filter((allocation) => allocation.type === "offset")
      .reduce((sum, allocation) => sum + allocation.amount, 0);

    const allocatedNet = Number((debtTotal - offsetTotal).toFixed(2));

    /*
     * Sécurité métier :
     *
     * les dépenses rattachées doivent
     * reproduire exactement le montant
     * du remboursement.
     */

    if (Math.abs(allocatedNet - reimbursementAmount) > 0.01) {
      throw new Error(
        "Impossible de rattacher correctement le remboursement aux dépenses concernées.",
      );
    }

    return allocations;
  }

  /* =========================================================
     ENREGISTRER LES ALLOCATIONS
  ========================================================= */

  async createExpenseAllocations(
    reimbursementId: number,
    allocations: ReimbursementExpenseAllocation[],
  ): Promise<void> {
    for (const allocation of allocations) {
      await databaseClient.query(
        `
          INSERT INTO reimbursement_expense (
            reimbursement_id,
            expense_id,
            allocated_amount,
            allocation_type
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          reimbursementId,

          allocation.expenseId,

          allocation.amount,

          allocation.type,
        ],
      );
    }
  }

  /* =========================================================
     VÉRIFIER SI UNE DÉPENSE EST VERROUILLÉE
  ========================================================= */

  async isExpenseLockedByReimbursement(expenseId: number): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      `
          SELECT
            1 AS locked

          FROM reimbursement_expense re

          JOIN reimbursement r
            ON r.id = re.reimbursement_id

          WHERE
            re.expense_id = ?
            AND r.status IN (
              'pending',
              'confirmed'
            )

          LIMIT 1
        `,
      [expenseId],
    );

    return Boolean(rows[0]);
  }
}

export default new ReimbursementRepository();
