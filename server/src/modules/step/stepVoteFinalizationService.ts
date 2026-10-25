import type { PoolConnection } from "mysql2/promise";
import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

import stepRepository from "./stepRepository";
import { calculateFinalVoteStatus } from "./stepVoteFinalization";

/* =====================================================
   DATE DU JOUR EN FRANCE — AAAA-MM-JJ
===================================================== */

const getTodayInParis = (): string => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

/* =====================================================
   FINALISER UNE DESTINATION DANS UNE TRANSACTION EXISTANTE

   IMPORTANT :
   Le voyage doit déjà être verrouillé avec FOR UPDATE.
   Cette fonction ne fait ni COMMIT ni ROLLBACK.
===================================================== */

export const finalizeStepWithinTransaction = async (
  connection: PoolConnection,
  stepId: number,
  tripId: number,
): Promise<boolean> => {
  // Verrouiller la destination.
  const [steps] = await connection.query<Rows>(
    `
      SELECT id, is_initial, vote_status
      FROM step
      WHERE id = ?
        AND trip_id = ?
      FOR UPDATE
    `,
    [stepId, tripId],
  );

  if (
    steps.length === 0 ||
    Number(steps[0].is_initial) !== 0 ||
    steps[0].vote_status !== "pending"
  ) {
    return false;
  }

  // Compter les votes des membres actuels.
  const [votes] = await connection.query<Rows>(
    `
      SELECT
        COUNT(*) AS total_votes,
        COALESCE(
          SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END),
          0
        ) AS yes_votes
      FROM vote v
      WHERE v.step_id = ?
        AND (
          EXISTS (
            SELECT 1
            FROM trip t
            WHERE t.id = ?
              AND t.user_id = v.user_id
          )
          OR EXISTS (
            SELECT 1
            FROM invitation i
            WHERE i.trip_id = ?
              AND i.user_id = v.user_id
              AND i.status = 'accepted'
          )
        )
    `,
    [stepId, tripId, tripId],
  );

  const totalVotes = Number(votes[0]?.total_votes ?? 0);
  const yesVotes = Number(votes[0]?.yes_votes ?? 0);
  const noVotes = totalVotes - yesVotes;

  const finalStatus = calculateFinalVoteStatus(yesVotes, noVotes);

  // Enregistrer définitivement les résultats.
  const [result] = await connection.query<Result>(
    `
      UPDATE step
      SET
        vote_status = ?,
        vote_finalized_at = UTC_TIMESTAMP(),
        final_yes_votes = ?,
        final_no_votes = ?
      WHERE id = ?
        AND trip_id = ?
        AND is_initial = 0
        AND vote_status = 'pending'
    `,
    [finalStatus, yesVotes, noVotes, stepId, tripId],
  );

  return result.affectedRows === 1;
};

/* =====================================================
   FINALISER UNE DESTINATION
===================================================== */

export const finalizeOneStep = async (
  stepId: number,
  todayInParis: string,
): Promise<boolean> => {
  const connection = await databaseClient.getConnection();

  try {
    await connection.beginTransaction();

    // Retrouver le voyage de la destination.
    const [stepRows] = await connection.query<Rows>(
      `
        SELECT trip_id
        FROM step
        WHERE id = ?
      `,
      [stepId],
    );

    if (stepRows.length === 0) {
      await connection.rollback();
      return false;
    }

    const tripId = Number(stepRows[0].trip_id);

    // Verrouiller le voyage en premier.
    const [tripRows] = await connection.query<Rows>(
      `
        SELECT
          DATE_FORMAT(start_at, '%Y-%m-%d') AS start_date
        FROM trip
        WHERE id = ?
        FOR UPDATE
      `,
      [tripId],
    );

    if (tripRows.length === 0) {
      await connection.rollback();
      return false;
    }

    // Ne pas finaliser avant le jour du départ.
    if (String(tripRows[0].start_date) > todayInParis) {
      await connection.rollback();
      return false;
    }

    // Calculer le résultat avec la fonction commune.
    const finalized = await finalizeStepWithinTransaction(
      connection,
      stepId,
      tripId,
    );

    if (!finalized) {
      await connection.rollback();
      return false;
    }

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* =====================================================
   FINALISER LES SCRUTINS ARRIVÉS À ÉCHÉANCE
===================================================== */

export const finalizePendingStepVotes = async (): Promise<{
  checked: number;
  finalized: number;
}> => {
  const todayInParis = getTodayInParis();

  const steps = await stepRepository.getStepsToFinalize(todayInParis);

  let finalized = 0;

  for (const step of steps) {
    const wasFinalized = await finalizeOneStep(Number(step.id), todayInParis);

    if (wasFinalized) {
      finalized += 1;
    }
  }

  return {
    checked: steps.length,
    finalized,
  };
};
