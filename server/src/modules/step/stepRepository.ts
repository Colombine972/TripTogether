import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Step } from "../../types/tripType";
import type { VoteWithUser } from "../../types/voteType";

class stepRepository {
  async selectByTrip(tripId: number): Promise<Step[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT id, city, country, trip_id
       FROM step
       WHERE trip_id = ?
       ORDER BY id ASC`,
      [tripId],
    );
    return rows as Step[];
  }

  async getStepWithTrip(stepId: number): Promise<{
    id: number;
    trip_id: number;
    city: string;
    country: string;
  } | null> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, trip_id, city, country FROM step WHERE id = ?",
      [stepId],
    );
    return rows.length > 0
      ? (rows[0] as {
          id: number;
          trip_id: number;
          city: string;
          country: string;
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
      `INSERT INTO vote (user_id, step_id, vote, comment) 
       VALUES (?, ?, ?, ?)`,
      [userId, stepId, vote ? 1 : 0, comment],
    );
    return result.insertId;
  }

  async selectByIdWithUser(voteId: number): Promise<VoteWithUser | null> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT v.*, u.firstname as user_name
       FROM vote AS v
       JOIN user AS u ON v.user_id = u.id
       WHERE v.id = ?`,
      [voteId],
    );
    return rows.length > 0 ? (rows[0] as VoteWithUser) : null;
  }

  async selectByStep(stepId: number): Promise<VoteWithUser[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        v.id,
        v.created_at,
        v.user_id,
        v.step_id,
        v.vote,
        v.comment,
        u.firstname AS user_name
      FROM vote v
      JOIN user u ON u.id = v.user_id
      WHERE v.step_id = ?
      ORDER BY v.created_at DESC`,
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
        s.trip_id AS trip_id,
        u.firstname AS creator_name,
        s.is_initial AS is_initial,
        s.image_url AS image_url,
        (
          SELECT COUNT(*) 
          FROM (
            SELECT user_id 
            FROM invitation 
            WHERE trip_id = s.trip_id AND status = 'accepted'
            UNION
            SELECT t.user_id 
            FROM trip t 
            WHERE t.id = s.trip_id
          ) AS members
        ) AS total_members,

        (
          SELECT COUNT(*) 
          FROM vote v 
          WHERE v.step_id = s.id
        ) AS total_votes,

        (
          SELECT COUNT(*) 
          FROM vote v 
          WHERE v.step_id = s.id AND v.vote = 1
        ) AS yes_votes

      FROM step s
      JOIN user u ON u.id = s.user_id
      WHERE s.trip_id = ?
      ORDER BY s.id ASC`,
      [tripId],
    );
    return rows;
  }

  async createStepCity(step: Omit<Step, "id">) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO step (city, country, trip_id, image_url, user_id) VALUES (?, ?, ?, ?, ?)",
      [step.city, step.country, step.trip_id, step.image_url, step.user_id],
    );
    return result.insertId;
  }
}

export default new stepRepository();
