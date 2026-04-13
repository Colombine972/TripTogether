import preferencesRepository from "../preferences/preferencesRepository";
import tripRepository from "../trip/tripRepository";
import sendEmail from "../../utils/sendEmail";

type TripMember = {
  id: number;
  firstname: string;
  email: string;
};

const notifyTripMembers = async (
  tripId: number,
  actorUserId: number,
  subject: string,
  text: string,
) => {
  const members = (await tripRepository.findMembersByTrip(
    tripId,
  )) as TripMember[];

  for (const member of members) {
    if (member.id === actorUserId) {
      continue;
    }

    const preferences = await preferencesRepository.readByUserId(member.id);

    if (!preferences?.email_trip_notifications) {
      continue;
    }

    if (!member.email) {
      continue;
    }

    await sendEmail(member.email, subject, text);
  }
};

export default {
  notifyTripMembers,
};