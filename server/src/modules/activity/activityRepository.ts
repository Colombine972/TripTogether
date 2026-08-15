import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import databaseClient from "../../../database/client";

export type ActivityType =
  | "expense_created"
  | "expense_updated"
  | "participant_joined"
  | "step_created"
  | "vote_created"
  | "step_validated"
  | "step_rejected"
  | "trip_updated"
  | "reimbursement_pending"
  | "reimbursement_confirmed"
  | "reimbursement_rejected";

export type Activity = {
  id: number;

  trip_id: number;

  user_id: number | null;

  firstname: string | null;
  lastname: string | null;

  type: ActivityType;

  title: string;
  message: string;

  reference_type: string | null;
  reference_id: number | null;

  created_at: string;
};

export type CreateActivityPayload = {
  tripId: number;

  userId?: number | null;

  type: ActivityType;

  title: string;
  message: string;

  referenceType?: string | null;
  referenceId?: number | null;
};

type ActivityRow =
  RowDataPacket &
    Activity;

class ActivityRepository {
  async create(
    payload: CreateActivityPayload,
  ): Promise<number> {
    const [result] =
      await databaseClient.query<ResultSetHeader>(
        `
          INSERT INTO activity (
            trip_id,
            user_id,
            type,
            title,
            message,
            reference_type,
            reference_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payload.tripId,

          payload.userId ?? null,

          payload.type,

          payload.title,

          payload.message,

          payload.referenceType ?? null,

          payload.referenceId ?? null,
        ],
      );

    return result.insertId;
  }

  async findByTripId(
    tripId: number,
    limit = 10,
  ): Promise<Activity[]> {
    const safeLimit =
      Math.min(
        Math.max(limit, 1),
        50,
      );

    const [rows] =
      await databaseClient.query<
        ActivityRow[]
      >(
        `
          SELECT
            activity.id,
            activity.trip_id,
            activity.user_id,

            user.firstname,
            user.lastname,

            activity.type,
            activity.title,
            activity.message,

            activity.reference_type,
            activity.reference_id,

            activity.created_at

          FROM activity

          LEFT JOIN user
            ON user.id = activity.user_id

          WHERE activity.trip_id = ?

          ORDER BY
            activity.created_at DESC,
            activity.id DESC

          LIMIT ?
        `,
        [
          tripId,
          safeLimit,
        ],
      );

    return rows.map(
      (row) => ({
        id:
          Number(row.id),

        trip_id:
          Number(
            row.trip_id,
          ),

        user_id:
          row.user_id !== null
            ? Number(
                row.user_id,
              )
            : null,

        firstname:
          row.firstname,

        lastname:
          row.lastname,

        type:
          row.type,

        title:
          row.title,

        message:
          row.message,

        reference_type:
          row.reference_type,

        reference_id:
          row.reference_id !== null
            ? Number(
                row.reference_id,
              )
            : null,

        created_at:
          row.created_at,
      }),
    );
  }
}

export default new ActivityRepository();