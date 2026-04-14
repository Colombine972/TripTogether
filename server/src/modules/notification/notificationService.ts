import preferencesRepository from "../preferences/preferencesRepository";
import tripRepository from "../trip/tripRepository";
import sendEmail from "../../utils/sendEmail";
import buildExpenseNotificationTemplate from "../../utils/buildExpenseNotificationTemplate";
import userRepository from "../user/userRepository";

type TripMember = {
  id: number;
  firstname: string;
  email: string;
};

const notifyExpenseAdded = async (
  tripId: number,
  actorUserId: number,
  expenseTitle: string,
  amount: number,
) => {
  
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const payer = await userRepository.read(actorUserId);

  const payerName = payer
    ? `${payer.firstname} ${payer.lastname}`
    : "Un participant";

  const tripLink = `${process.env.CLIENT_URL}/trip/${tripId}`;

  const members = (await tripRepository.findMembersByTrip(
    tripId,
  )) as TripMember[];

  for (const member of members) {
    if (member.id === actorUserId) {
      continue;
    }

    if (!member.email) {
      continue;
    }

    const preferences = await preferencesRepository.readByUserId(member.id);

    if (!preferences?.email_trip_notifications) {
      continue;
    }

    const html = buildExpenseNotificationTemplate({
      firstname: member.firstname,
      tripTitle: trip.title,
      payerName,
      expenseTitle,
      amount,
      tripLink,
    });

    try {
      await sendEmail(
        member.email,
        `Nouvelle dépense sur "${trip.title}"`,
        `Une nouvelle dépense a été ajoutée au voyage "${trip.title}".`,
        html,
      );
    } catch (error) {
      console.error(`Erreur envoi email à ${member.email} :`, error);
    }
  }
};

export default {
  notifyExpenseAdded,
};
