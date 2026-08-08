import type { ResultSetHeader, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

export type NotificationType =
  | "reimbursement_pending"
  | "reimbursement_confirmed"
  | "reimbursement_rejected"
  | "expense_created"
  | "expense_updated"
  | "participant_joined"
  | "trip_invitation"
  | "trip_updated"
  | "vote_created"
  | "general";

export type Notification = {
  id: number;
  user_id: number;
  trip_id: number | null;
  type: NotificationType;
  title: string;
  message: string;
  emoji: string | null;
  context_label: string | null;
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
};

type NotificationRow = RowDataPacket &
  Omit<Notification, "is_read"> & {
    is_read: number | boolean;
  };

export type CreateNotificationPayload = {
  userId: number;
  tripId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  emoji?: string | null;
  contextLabel?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
};

class NotificationRepository {
  async findByUserId(
    userId: number,
  ): Promise<Notification[]> {
    const [rows] =
      await databaseClient.query<
        NotificationRow[]
      >(
        `
          SELECT
            id,
            user_id,
            trip_id,
            type,
            title,
            message,
            emoji,
            context_label,
            reference_type,
            reference_id,
            is_read,
            created_at
          FROM notification
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 50
        `,
        [userId],
      );

    return rows.map((row) => ({
      id: Number(row.id),
      user_id: Number(row.user_id),
      trip_id:
        row.trip_id !== null
          ? Number(row.trip_id)
          : null,
      type: row.type,
      title: row.title,
      message: row.message,
      emoji: row.emoji,
      context_label:
        row.context_label,
      reference_type:
        row.reference_type,
      reference_id:
        row.reference_id !== null
          ? Number(
              row.reference_id,
            )
          : null,
      is_read: Boolean(row.is_read),
      created_at:
        row.created_at,
    }));
  }

  async countUnreadByUserId(
    userId: number,
  ): Promise<number> {
    const [rows] =
      await databaseClient.query<
        (
          RowDataPacket & {
            unread_count: number;
          }
        )[]
      >(
        `
          SELECT COUNT(*) AS unread_count
          FROM notification
          WHERE user_id = ?
            AND is_read = FALSE
        `,
        [userId],
      );

    return Number(
      rows[0]?.unread_count || 0,
    );
  }

  async create(
    payload: CreateNotificationPayload,
  ): Promise<number> {
    const [result] =
      await databaseClient.query<ResultSetHeader>(
        `
          INSERT INTO notification (
            user_id,
            trip_id,
            type,
            title,
            message,
            emoji,
            context_label,
            reference_type,
            reference_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payload.userId,
          payload.tripId ?? null,
          payload.type,
          payload.title,
          payload.message,
          payload.emoji ?? null,
          payload.contextLabel ?? null,
          payload.referenceType ?? null,
          payload.referenceId ?? null,
        ],
      );

    return result.insertId;
  }

  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    const [result] =
      await databaseClient.query<ResultSetHeader>(
        `
          UPDATE notification
          SET is_read = TRUE
          WHERE id = ?
            AND user_id = ?
        `,
        [
          notificationId,
          userId,
        ],
      );

    return (
      result.affectedRows > 0
    );
  }

  async markAllAsRead(
    userId: number,
  ): Promise<number> {
    const [result] =
      await databaseClient.query<ResultSetHeader>(
        `
          UPDATE notification
          SET is_read = TRUE
          WHERE user_id = ?
            AND is_read = FALSE
        `,
        [userId],
      );

    return result.affectedRows;
  }

  async deleteByIdAndUserId(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    const [result] =
      await databaseClient.query<ResultSetHeader>(
        `
          DELETE FROM notification
          WHERE id = ?
            AND user_id = ?
        `,
        [
          notificationId,
          userId,
        ],
      );

    return (
      result.affectedRows > 0
    );
  }
}

export default new NotificationRepository();