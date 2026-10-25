import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Step } from "../../types/tripType";
import type { VoteWithUser } from "../../types/voteType";

type CreateStep = {
  city: string;
  country: string;
  trip_id: number;
  place_id?: string | null;
  user_id: number;
  start_at: string;
  end_at: string;
};

class StepRepository {
  async selectByTrip(tripId: number): Promise<Step[]> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          id,
          city,
          country,
          start_at,
          end_at,
          trip_id,
          place_id,
          user_id
        FROM step
        WHERE trip_id = ?
        ORDER BY id ASC
      `,
      [tripId],
    );

    return rows as Step[];
  }

  async getStepWithTrip(stepId: number): Promise<{
    id: number;
    trip_id: number;
    city: string;
    country: string;
    place_id: string | null;
    start_at: string | null;
    end_at: string | null;
    is_initial: boolean | number;
    vote_finalized_at: string | Date | null;
    final_yes_votes: number | null;
    final_no_votes: number | null;
  } | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          id,
          trip_id,
          city,
          country,
          place_id,
          start_at,
          end_at,
          is_initial
          vote_finalized_at,
          final_yes_votes,
          final_no_votes
        FROM step
        WHERE id = ?
      `,
      [stepId],
    );

    return rows.length > 0
      ? (rows[0] as {
          id: number;
          trip_id: number;
          city: string;
          country: string;
          place_id: string | null;
          start_at: string | null;
          end_at: string | null;
          is_initial: boolean | number;
          vote_finalized_at: string | Date | null;
          final_yes_votes: number | null;
          final_no_votes: number | null;
        })
      : null;
  }

  async hasUserVoted(userId: number, stepId: number): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id FROM vote WHERE user_id = ? AND step_id = ?",
      [userId, stepId],
    );

    return rows.length > 0;
  }

  async create(
    userId: number,
    stepId: number,
    vote: boolean,
    comment: string | null,
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `
        INSERT INTO vote
          (user_id, step_id, vote, comment)
        VALUES (?, ?, ?, ?)
      `,
      [userId, stepId, vote ? 1 : 0, comment],
    );

    return result.insertId;
  }

  /* =========================================================
     MODIFIER UN VOTE EXISTANT
  ========================================================= */

  async updateVote(
    userId: number,
    stepId: number,
    vote: boolean,
    comment: string | null,
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `
        UPDATE vote
        SET
          vote = ?,
          comment = ?
        WHERE user_id = ?
          AND step_id = ?
      `,
      [vote ? 1 : 0, comment, userId, stepId],
    );

    return result.affectedRows;
  }

  async selectByIdWithUser(voteId: number): Promise<VoteWithUser | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          v.*,
          u.firstname AS user_name
        FROM vote AS v
        JOIN user AS u
          ON v.user_id = u.id
        WHERE v.id = ?
      `,
      [voteId],
    );

    return rows.length > 0 ? (rows[0] as VoteWithUser) : null;
  }

  /* =========================================================
     RÉCUPÉRER LES VOTES DES MEMBRES ACTUELS
  ========================================================= */

  async selectByStep(stepId: number): Promise<VoteWithUser[]> {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT
        v.id,
        v.created_at,
        v.user_id,
        v.step_id,
        v.vote,
        v.comment,
        u.firstname AS user_name
      FROM vote v
      JOIN user u ON u.id = v.user_id
      JOIN step s ON s.id = v.step_id
      WHERE v.step_id = ?
        AND (
          s.vote_finalized_at IS NOT NULL
          OR EXISTS (
            SELECT 1
            FROM trip t
            WHERE t.id = s.trip_id
              AND t.user_id = v.user_id
          )
          OR EXISTS (
            SELECT 1
            FROM invitation i
            WHERE i.trip_id = s.trip_id
              AND i.user_id = v.user_id
              AND i.status = 'accepted'
          )
        )
      ORDER BY v.created_at DESC
    `,
      [stepId],
    );

    return rows as VoteWithUser[];
  }

  async delete(stepId: number): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM step WHERE id = ?",
      [stepId],
    );

    return result.affectedRows;
  }

  async getStepsWithVotes(tripId: number): Promise<Rows> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          s.id AS id,
          s.city AS city,
          s.country AS country,
          s.start_at AS start_at,
          s.end_at AS end_at,
          s.trip_id AS trip_id,
          u.firstname AS creator_name,
          s.is_initial AS is_initial,
          s.place_id AS place_id,
          s.vote_status AS vote_status,
          s.vote_finalized_at AS vote_finalized_at,
          s.final_yes_votes AS final_yes_votes,
          s.final_no_votes AS final_no_votes,

          (
            SELECT COUNT(DISTINCT member_id)
            FROM (
              SELECT i.user_id AS member_id
              FROM invitation i
              WHERE i.trip_id = ?
                AND i.status = 'accepted'

              UNION

              SELECT t.user_id AS member_id
              FROM trip t
              WHERE t.id = ?
            ) AS members
          ) AS total_members,

          (
            SELECT COUNT(*)
            FROM vote v
            WHERE v.step_id = s.id
              AND (
                EXISTS (
                  SELECT 1
                  FROM trip t
                  WHERE t.id = s.trip_id
                    AND t.user_id = v.user_id
                )
                OR EXISTS (
                  SELECT 1
                  FROM invitation i
                  WHERE i.trip_id = s.trip_id
                    AND i.user_id = v.user_id
                    AND i.status = 'accepted'
                )
              )
          ) AS total_votes,

          (
            SELECT COUNT(*)
            FROM vote v
            WHERE v.step_id = s.id
              AND v.vote = 1
              AND (
                EXISTS (
                  SELECT 1
                  FROM trip t
                  WHERE t.id = s.trip_id
                    AND t.user_id = v.user_id
                )
                OR EXISTS (
                  SELECT 1
                  FROM invitation i
                  WHERE i.trip_id = s.trip_id
                    AND i.user_id = v.user_id
                    AND i.status = 'accepted'
                )
              )
          ) AS yes_votes

        FROM step s

        JOIN user u
          ON u.id = s.user_id

        WHERE s.trip_id = ?

        ORDER BY
          CASE
            WHEN s.start_at IS NULL THEN 1
            ELSE 0
          END,
          s.start_at ASC,
          s.id ASC
      `,
      [tripId, tripId, tripId],
    );

    return rows;
  }

  /* =========================================================
     RÉCUPÉRER LES DESTINATIONS À FINALISER
  ========================================================= */

  async getStepsToFinalize(todayInParis: string): Promise<Rows> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          s.id,
          s.trip_id,
          s.city,
          s.vote_status,
          t.start_at AS trip_start_at

        FROM step s

        JOIN trip t
          ON t.id = s.trip_id

        WHERE s.is_initial = 0
          AND s.vote_status = 'pending'
          AND DATE_FORMAT(t.start_at, '%Y-%m-%d') <= ?

        ORDER BY t.start_at ASC, s.id ASC
      `,
      [todayInParis],
    );

    return rows;
  }

  /* =========================================================
     ENREGISTRER LE RÉSULTAT DÉFINITIF D'UNE DESTINATION
  ========================================================= */

  async finalizeStepVote(
    stepId: number,
    status: "validated" | "rejected" | "no_decision",
    yesVotes: number,
    noVotes: number,
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      `
        UPDATE step
        SET
          vote_status = ?,
          vote_finalized_at = UTC_TIMESTAMP(),
          final_yes_votes = ?,
          final_no_votes = ?

        WHERE id = ?
          AND is_initial = 0
          AND vote_status = 'pending'
      `,
      [status, yesVotes, noVotes, stepId],
    );

    return result.affectedRows === 1;
  }

  async createStepCity(step: CreateStep) {
    const [result] = await databaseClient.query<Result>(
      `
        INSERT INTO step
          (
            city,
            country,
            start_at,
            end_at,
            trip_id,
            place_id,
            user_id,
            vote_status
          )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        step.city,
        step.country,
        step.start_at,
        step.end_at,
        step.trip_id,
        step.place_id ?? null,
        step.user_id,
      ],
    );

    return result.insertId;
  }
}

export default new StepRepository();
