import argon2 from "argon2";
import crypto from "node:crypto";
import userRepository from "./userRepository";

const exportUserData = async (userId: number) => {
  const user = await userRepository.readExportProfile(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  const preferences = await userRepository.readPreferencesByUserId(userId);
  const ownedTrips = await userRepository.readOwnedTripsByUserId(userId);
  const participatedTrips =
    await userRepository.readParticipatedTripsByUserId(userId);
  const expenses = await userRepository.readExpensesByUserId(userId);
  const expenseShares = await userRepository.readExpenseSharesByUserId(userId);
  const invitations = await userRepository.readInvitationsByUserId(userId);

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      avatar_url: user.avatar_url,
    },
    preferences,
    trips: {
      owned: ownedTrips,
      participated: participatedTrips,
    },
    expenses,
    expenseShares,
    invitations,
  };
};

const deleteMyAccount = async (userId: number) => {
  const user = await userRepository.read(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  const anonymizedEmail = `deleted_${userId}_${Date.now()}@deleted.local`;
  const randomPassword = crypto.randomUUID();
  const anonymizedPassword = await argon2.hash(randomPassword);

  await userRepository.deleteMyAccount({
    userId,
    currentEmail: user.email,
    anonymizedEmail,
    anonymizedPassword,
  });
};

export default {
  exportUserData,
  deleteMyAccount,
};