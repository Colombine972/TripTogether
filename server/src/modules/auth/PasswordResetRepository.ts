import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type UserForPasswordReset = {
  id: number;
  email: string;
  firstname: string;
};

type PasswordResetToken = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
};

class PasswordResetRepository {
  async findUserByEmail(
    email: string,
  ): Promise<UserForPasswordReset | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT id, email, firstname
        FROM user
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as UserForPasswordReset;
  }

  async deleteTokensForUser(userId: number): Promise<void> {
    await databaseClient.query<Result>(
      `
        DELETE FROM password_reset_token
        WHERE user_id = ?
      `,
      [userId],
    );
  }

  async createToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await databaseClient.query<Result>(
      `
        INSERT INTO password_reset_token (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
      `,
      [userId, tokenHash, expiresAt],
    );
  }

  async findValidToken(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    const [rows] = await databaseClient.query<Rows>(
      `
        SELECT
          id,
          user_id,
          token_hash,
          expires_at,
          used_at
        FROM password_reset_token
        WHERE token_hash = ?
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
      `,
      [tokenHash],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as PasswordResetToken;
  }

  async updatePassword(
    userId: number,
    hashedPassword: string,
  ): Promise<void> {
    await databaseClient.query<Result>(
      `
        UPDATE user
        SET password = ?
        WHERE id = ?
      `,
      [hashedPassword, userId],
    );
  }

  async markTokenAsUsed(tokenId: number): Promise<void> {
    await databaseClient.query<Result>(
      `
        UPDATE password_reset_token
        SET used_at = NOW()
        WHERE id = ?
      `,
      [tokenId],
    );
  }
}

export default new PasswordResetRepository();