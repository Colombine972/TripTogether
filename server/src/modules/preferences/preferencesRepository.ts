import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type UserPreferences = {
  id: number;
  user_id: number;
  email_trip_notifications: boolean;
};

const create = async (userId: number) => {
  const [result] = await databaseClient.query<Result>(
    `
      INSERT INTO user_preferences (user_id, email_trip_notifications)
      VALUES (?, ?)
    `,
    [userId, true],
  );

  return result;
};

const readByUserId = async (userId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `
      SELECT id, user_id, email_trip_notifications
      FROM user_preferences
      WHERE user_id = ?
    `,
    [userId],
  );

  return (rows[0] as UserPreferences) ?? null;
};

const updateByUserId = async (
  userId: number,
  emailTripNotifications: boolean,
) => {
  const [result] = await databaseClient.query<Result>(
    `
      UPDATE user_preferences
      SET email_trip_notifications = ?
      WHERE user_id = ?
    `,
    [emailTripNotifications, userId],
  );

  return result;
};

export default {
  create,
  readByUserId,
  updateByUserId,
};