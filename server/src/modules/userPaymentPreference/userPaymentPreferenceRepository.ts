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
}

export default new UserPaymentPreferenceRepository();