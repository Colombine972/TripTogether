import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type UserPreferences = {
  id: number;
  user_id: number;
  email_trip_notifications: boolean;
  default_currency: string;
};

const create = async (userId: number) => {
  const [result] = await databaseClient.query<Result>(
    `
      INSERT INTO user_preferences (user_id, email_trip_notifications, default_currency)
      VALUES (?, ?, ?)
    `,
    [userId, true, "EUR"],
  );

  return result;
};

const readByUserId = async (userId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `
      SELECT id, user_id, email_trip_notifications, default_currency
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
  defaultCurrency: string,
) => {
  const [result] = await databaseClient.query<Result>(
    `
      UPDATE user_preferences
      SET email_trip_notifications = ?,
      default_currency = ?
      WHERE user_id = ?
    `,
    [emailTripNotifications, defaultCurrency, userId],
  );

  return readByUserId(userId);
};

export default {
  create,
  readByUserId,
  updateByUserId,
};