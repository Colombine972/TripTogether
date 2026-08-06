import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type {
  UpdatePaymentPreferencePayload,
  UserPaymentPreference,
} from "../../types/paymentPreference";

class UserPaymentPreferenceRepository {
  async findByUserId(
    userId: number,
  ): Promise<UserPaymentPreference | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT
        id,
        user_id,
        preferred_method,
        wero_phone,
        iban,
        iban_holder_name,
        created_at,
        updated_at
      FROM user_payment_preference
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (!rows[0]) {
      return null;
    }

    return rows[0] as UserPaymentPreference;
  }

  async upsert(payload: UpdatePaymentPreferencePayload) {
    const [result] = await databaseClient.query<Result>(
      `
      INSERT INTO user_payment_preference (
        user_id,
        preferred_method,
        wero_phone,
        iban,
        iban_holder_name
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        preferred_method = VALUES(preferred_method),
        wero_phone = VALUES(wero_phone),
        iban = VALUES(iban),
        iban_holder_name = VALUES(iban_holder_name)
      `,
      [
        payload.userId,
        payload.preferredMethod,
        payload.weroPhone,
        payload.iban,
        payload.ibanHolderName,
      ],
    );

    return result.affectedRows;
  }

  async findForTripParticipant(
  tripId: number,
  requesterId: number,
  participantId: number,
) {
  const [rows] = await databaseClient.query<Rows>(
    `
    SELECT
      u.id AS participant_id,
      u.firstname,
      upp.preferred_method,
      upp.wero_phone,
      upp.iban,
      upp.iban_holder_name
    FROM user u

    INNER JOIN trip_user requested_participant
      ON requested_participant.user_id = u.id
      AND requested_participant.trip_id = ?

    INNER JOIN trip_user connected_participant
      ON connected_participant.trip_id = ?
      AND connected_participant.user_id = ?

    LEFT JOIN user_payment_preference upp
      ON upp.user_id = u.id

    WHERE u.id = ?
    LIMIT 1
    `,
    [
      tripId,
      tripId,
      requesterId,
      participantId,
    ],
  );

  return rows[0] ?? null;
}
}

export default new UserPaymentPreferenceRepository();