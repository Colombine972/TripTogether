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

    await sendEmail(
      member.email,
      "Nouvelle dépense sur votre voyage TripTogether",
      `Bonjour ${member.firstname},

Une nouvelle dépense a été ajoutée sur un voyage auquel vous participez.

Dépense : ${expenseTitle}
Montant : ${amount.toFixed(2)} €

Connectez-vous à TripTogether pour consulter les détails.

À bientôt,
TripTogether`,
    );
  }
};

export default {
  notifyExpenseAdded,
};