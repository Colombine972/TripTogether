import preferencesRepository from "../preferences/preferencesRepository";
import tripRepository from "../trip/tripRepository";
import sendEmail from "../../utils/sendEmail";

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

    try {
      await sendEmail(
        member.email,
        `Nouvelle dépense sur "${trip.title}"`,
        `Bonjour ${member.firstname},

Une nouvelle dépense a été ajoutée au voyage "${trip.title}".

Dépense : ${expenseTitle}
Montant : ${amount.toFixed(2)} €

Connectez-vous à TripTogether pour consulter les détails.

À bientôt ✈️
TripTogether`,
      );
    } catch (error) {
      console.error(`Erreur envoi email à ${member.email}`, error);
    }
  }
};

export default {
  notifyExpenseAdded,
};
