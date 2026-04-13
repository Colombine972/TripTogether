import preferencesRepository from "../preferences/preferencesRepository";
import userRepository from "../user/userRepository";
import tripRepository from "../trip/tripRepository";
import sendEmail from "../../utils/sendEmail";

const notifyTripMembers = async (
  tripId: number,
  actorUserId: number,
  subject: string,
  text: string,
) => {
  const members = await tripRepository.readMembersByTripId(tripId);

  for (const member of members) {
    if (member.id === actorUserId) {
      continue;
    }

    const preferences = await preferencesRepository.readByUserId(member.id);

    if (!preferences?.email_trip_notifications) {
      continue;
    }

    const user = await userRepository.read(member.id);

    if (!user?.email) {
      continue;
    }

    await sendEmail(user.email, subject, text);
  }
};

export default {
  notifyTripMembers,
};