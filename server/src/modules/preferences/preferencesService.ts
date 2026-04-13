import preferencesRepository from "./preferencesRepository";

const getUserPreferences = async (userId: number) => {
  let preferences = await preferencesRepository.readByUserId(userId);

  if (!preferences) {
    await preferencesRepository.create(userId);
    preferences = await preferencesRepository.readByUserId(userId);
  }

  return preferences;
};

const updateUserPreferences = async (
  userId: number,
  emailTripNotifications: boolean,
) => {
  const existing = await preferencesRepository.readByUserId(userId);

  if (!existing) {
    await preferencesRepository.create(userId);
  }

  await preferencesRepository.updateByUserId(
    userId,
    emailTripNotifications,
  );

  return preferencesRepository.readByUserId(userId);
};

export default {
  getUserPreferences,
  updateUserPreferences,
};