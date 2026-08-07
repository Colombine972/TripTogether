import preferencesRepository from "../preferences/preferencesRepository";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";

import notificationRepository, {
  type CreateNotificationPayload,
} from "./notificationRepository";

import sendEmail from "../../utils/sendEmail";
import buildExpenseNotificationTemplate from "../../utils/buildExpenseNotificationTemplate";

type TripMember = {
  id: number;
  firstname: string;
  email: string;
};

const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<number> => {
  if (!payload.userId) {
    throw new Error(
      "Le destinataire de la notification est obligatoire.",
    );
  }

  if (!payload.title.trim()) {
    throw new Error(
      "Le titre de la notification est obligatoire.",
    );
  }

  if (!payload.message.trim()) {
    throw new Error(
      "Le message de la notification est obligatoire.",
    );
  }

  return notificationRepository.create({
    ...payload,

    title: payload.title.trim(),

    message: payload.message.trim(),
  });
};


const getUserNotifications = async (
  userId: number,
) => {
  if (
    !userId ||
    Number.isNaN(userId)
  ) {
    throw new Error(
      "Utilisateur invalide.",
    );
  }

  return notificationRepository.findByUserId(
    userId,
  );
};


const getUnreadCount = async (
  userId: number,
): Promise<number> => {
  if (
    !userId ||
    Number.isNaN(userId)
  ) {
    throw new Error(
      "Utilisateur invalide.",
    );
  }

  return notificationRepository.countUnreadByUserId(
    userId,
  );
};


const markAsRead = async (
  notificationId: number,
  userId: number,
): Promise<void> => {
  if (
    !notificationId ||
    Number.isNaN(notificationId)
  ) {
    throw new Error(
      "Notification invalide.",
    );
  }

  if (
    !userId ||
    Number.isNaN(userId)
  ) {
    throw new Error(
      "Utilisateur invalide.",
    );
  }

  const updated =
    await notificationRepository.markAsRead(
      notificationId,
      userId,
    );

  if (!updated) {
    throw new Error(
      "Notification introuvable.",
    );
  }
};


const markAllAsRead = async (
  userId: number,
): Promise<number> => {
  if (
    !userId ||
    Number.isNaN(userId)
  ) {
    throw new Error(
      "Utilisateur invalide.",
    );
  }

  return notificationRepository.markAllAsRead(
    userId,
  );
};


const notifyExpenseAdded = async (
  tripId: number,
  actorUserId: number,
  expenseId: number,
  expenseTitle: string,
  amount: number,
): Promise<void> => {


  const trip =
    await tripRepository.read(
      tripId,
    );

  if (!trip) {
    return;
  }



  const payer =
    await userRepository.read(
      actorUserId,
    );

  const payerName = payer
    ? `${payer.firstname} ${payer.lastname}`
    : "Un participant";



  const tripLink =
    `${process.env.CLIENT_URL}/trip/${tripId}`;



  const members =
    (await tripRepository.findMembersByTrip(
      tripId,
    )) as TripMember[];



  for (const member of members) {
    /*
     * L'utilisateur qui ajoute la dépense
     * ne reçoit pas sa propre notification.
     */
    if (
      member.id === actorUserId
    ) {
      continue;
    }


    try {
      await createNotification({
        userId: member.id,

        tripId,

        type: "expense_created",

        title:
          "Nouvelle dépense",

        message:
          `${payerName} a ajouté « ${expenseTitle} » — ${amount.toFixed(
            2,
          )} €.`,

        emoji: "💰",

        contextLabel:
          `Voyage ${trip.title}`,

        /*
         * Ces deux champs permettront ensuite
         * d'ouvrir directement la dépense concernée.
         */
        referenceType:
          "expense",

        referenceId:
          expenseId,
      });
    } catch (error) {
      console.error(
        `Erreur création notification interne pour l'utilisateur ${member.id} :`,
        error,
      );
    }

    /*
     * La notification interne est toujours créée.
     *
     * L'email, lui, dépend des préférences utilisateur.
     */
    if (!member.email) {
      continue;
    }

    const preferences =
      await preferencesRepository.readByUserId(
        member.id,
      );

    if (
      !preferences?.email_trip_notifications
    ) {
      continue;
    }

    const html =
      buildExpenseNotificationTemplate({
        firstname:
          member.firstname,

        tripTitle:
          trip.title,

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
      console.error(
        `Erreur envoi email à ${member.email} :`,
        error,
      );
    }
  }
};


export default {
  createNotification,

  getUserNotifications,
  getUnreadCount,

  markAsRead,
  markAllAsRead,

  notifyExpenseAdded,
};