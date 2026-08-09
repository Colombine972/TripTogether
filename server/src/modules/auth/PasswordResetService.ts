import argon2 from "argon2";
import crypto from "node:crypto";

import passwordResetRepository from "./PasswordResetRepository";

class PasswordResetService {
  private readonly TOKEN_DURATION_MINUTES = 30;

  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  getExpirationDate(): Date {
    const expiresAt = new Date();

    expiresAt.setMinutes(
      expiresAt.getMinutes() + this.TOKEN_DURATION_MINUTES,
    );

    return expiresAt;
  }

  async createPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user =
      await passwordResetRepository.findUserByEmail(normalizedEmail);

    /*
     * Important :
     * on ne révèle jamais si l'adresse existe ou non.
     */
    if (!user) {
      return null;
    }

    await passwordResetRepository.deleteTokensForUser(user.id);

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getExpirationDate();

    await passwordResetRepository.createToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    return {
      token,
      user,
      expiresAt,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<boolean> {
    if (newPassword.length < 8) {
      throw new Error(
        "Le mot de passe doit contenir au moins 8 caractères",
      );
    }

    const tokenHash = this.hashToken(token);

    const resetToken =
      await passwordResetRepository.findValidToken(tokenHash);

    if (!resetToken) {
      return false;
    }

    const hashedPassword = await argon2.hash(newPassword);

    await passwordResetRepository.updatePassword(
      resetToken.user_id,
      hashedPassword,
    );

    await passwordResetRepository.markTokenAsUsed(resetToken.id);

    return true;
  }
}

export default new PasswordResetService();