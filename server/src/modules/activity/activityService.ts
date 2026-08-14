import activityRepository, {
  type Activity,
  type CreateActivityPayload,
} from "./activityRepository";

const createActivity = async (
  payload: CreateActivityPayload,
): Promise<number> => {
  if (
    !Number.isInteger(payload.tripId) ||
    payload.tripId <= 0
  ) {
    throw new Error(
      "Voyage invalide.",
    );
  }

  if (
    payload.userId !== undefined &&
    payload.userId !== null &&
    (!Number.isInteger(payload.userId) ||
      payload.userId <= 0)
  ) {
    throw new Error(
      "Utilisateur invalide.",
    );
  }

  const title =
    payload.title.trim();

  const message =
    payload.message.trim();

  if (!title) {
    throw new Error(
      "Le titre de l'activité est obligatoire.",
    );
  }

  if (!message) {
    throw new Error(
      "Le message de l'activité est obligatoire.",
    );
  }

  return activityRepository.create({
    ...payload,
    title,
    message,
  });
};

const getTripActivities = async (
  tripId: number,
  limit = 10,
): Promise<Activity[]> => {
  if (
    !Number.isInteger(tripId) ||
    tripId <= 0
  ) {
    throw new Error(
      "Voyage invalide.",
    );
  }

  return activityRepository.findByTripId(
    tripId,
    limit,
  );
};

export default {
  createActivity,
  getTripActivities,
};