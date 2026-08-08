import buildExpenseNotificationTemplate from "../../utils/buildExpenseNotificationTemplate";
import sendEmail from "../../utils/sendEmail";
import preferencesRepository from "../preferences/preferencesRepository";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";
import notificationRepository, {
  type CreateNotificationPayload,
} from "./notificationRepository";

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

const getUserNotifications = async (userId: number) => {
  if (!userId || Number.isNaN(userId)) {
    throw new Error("Utilisateur invalide.");
  }

  return notificationRepository.findByUserId(userId);
};

const getUnreadCount = async (
  userId: number,
): Promise<number> => {
  if (!userId || Number.isNaN(userId)) {
    throw new Error("Utilisateur invalide.");
  }

  return notificationRepository.countUnreadByUserId(userId);
};

const markAsRead = async (
  notificationId: number,
  userId: number,
): Promise<void> => {
  if (!notificationId || Number.isNaN(notificationId)) {
    throw new Error("Notification invalide.");
  }

  if (!userId || Number.isNaN(userId)) {
    throw new Error("Utilisateur invalide.");
  }

  const updated =
    await notificationRepository.markAsRead(
      notificationId,
      userId,
    );

  if (!updated) {
    throw new Error("Notification introuvable.");
  }
};

const markAllAsRead = async (
  userId: number,
): Promise<number> => {
  if (!userId || Number.isNaN(userId)) {
    throw new Error("Utilisateur invalide.");
  }

  return notificationRepository.markAllAsRead(userId);
};

const notifyExpenseAdded = async (
  tripId: number,
  actorUserId: number,
  expenseId: number,
  expenseTitle: string,
  amount: number,
): Promise<void> => {
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const actor = await userRepository.read(actorUserId);

  const actorName = actor
    ? `${actor.firstname} ${actor.lastname}`.trim()
    : "Un participant";

  const tripLink =
    `${process.env.CLIENT_URL}/trip/${tripId}`;

  const members =
    (await tripRepository.findMembersByTrip(
      tripId,
    )) as TripMember[];

  for (const member of members) {
    if (Number(member.id) === Number(actorUserId)) {
      continue;
    }

    try {
      await createNotification({
        userId: member.id,
        tripId,
        type: "expense_created",
        title: "Nouvelle dépense",
        message:
          `${actorName} a ajouté « ${expenseTitle} » — ${amount.toFixed(
            2,
          )} €.`,
        emoji: "💰",
        contextLabel: `Voyage ${trip.title}`,
        referenceType: "expense",
        referenceId: expenseId,
      });
    } catch (error) {
      console.error(
        `Erreur création notification expense_created pour l'utilisateur ${member.id} :`,
        error,
      );
    }

    if (!member.email) {
      continue;
    }

    const preferences =
      await preferencesRepository.readByUserId(
        member.id,
      );

    if (!preferences?.email_trip_notifications) {
      continue;
    }

    const html =
      buildExpenseNotificationTemplate({
        firstname: member.firstname,
        tripTitle: trip.title,
        payerName: actorName,
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

const notifyExpenseUpdated = async (
  tripId: number,
  actorUserId: number,
  expenseId: number,
  expenseTitle: string,
): Promise<void> => {
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const actor = await userRepository.read(actorUserId);

  const actorName = actor
    ? `${actor.firstname} ${actor.lastname}`.trim()
    : "Un participant";

  const members =
    (await tripRepository.findMembersByTrip(
      tripId,
    )) as TripMember[];

  for (const member of members) {
    if (Number(member.id) === Number(actorUserId)) {
      continue;
    }

    try {
      await createNotification({
        userId: member.id,
        tripId,
        type: "expense_updated",
        title: "Dépense modifiée",
        message:
          `${actorName} a modifié « ${expenseTitle} ».`,
        emoji: "✏️",
        contextLabel: `Voyage ${trip.title}`,
        referenceType: "expense",
        referenceId: expenseId,
      });
    } catch (error) {
      console.error(
        `Erreur création notification expense_updated pour l'utilisateur ${member.id} :`,
        error,
      );
    }
  }
};

const formatCurrency = (
  amount: number,
  currency: string,
): string => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const notifyReimbursementPending = async (
  tripId: number,
  fromUserId: number,
  toUserId: number,
  reimbursementId: number,
  amount: number,
  currency: string,
): Promise<void> => {
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const fromUser =
    await userRepository.read(fromUserId);

  const fromUserName = fromUser
    ? `${fromUser.firstname} ${fromUser.lastname}`.trim()
    : "Un participant";

  const formattedAmount =
    formatCurrency(amount, currency);

  try {
    await createNotification({
      userId: toUserId,
      tripId,
      type: "reimbursement_pending",
      title: "Remboursement à confirmer",
      message:
        `${fromUserName} indique vous avoir remboursé ${formattedAmount}.`,
      emoji: "💸",
      contextLabel: `Voyage ${trip.title}`,
      referenceType: "reimbursement",
      referenceId: reimbursementId,
    });
  } catch (error) {
    console.error(
      `Erreur création notification reimbursement_pending pour l'utilisateur ${toUserId} :`,
      error,
    );
  }
};

const notifyReimbursementConfirmed = async (
  tripId: number,
  fromUserId: number,
  confirmedByUserId: number,
  reimbursementId: number,
  amount: number,
  currency: string,
): Promise<void> => {
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const confirmedBy =
    await userRepository.read(
      confirmedByUserId,
    );

  const confirmedByName = confirmedBy
    ? `${confirmedBy.firstname} ${confirmedBy.lastname}`.trim()
    : "Le bénéficiaire";

  const formattedAmount =
    formatCurrency(amount, currency);

  try {
    await createNotification({
      userId: fromUserId,
      tripId,
      type: "reimbursement_confirmed",
      title: "Remboursement confirmé",
      message:
        `${confirmedByName} a confirmé la réception de votre remboursement de ${formattedAmount}.`,
      emoji: "✅",
      contextLabel: `Voyage ${trip.title}`,
      referenceType: "reimbursement",
      referenceId: reimbursementId,
    });
  } catch (error) {
    console.error(
      `Erreur création notification reimbursement_confirmed pour l'utilisateur ${fromUserId} :`,
      error,
    );
  }
};

const notifyReimbursementRejected = async (
  tripId: number,
  fromUserId: number,
  rejectedByUserId: number,
  reimbursementId: number,
  amount: number,
  currency: string,
): Promise<void> => {
  const trip = await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const rejectedBy =
    await userRepository.read(
      rejectedByUserId,
    );

  const rejectedByName = rejectedBy
    ? `${rejectedBy.firstname} ${rejectedBy.lastname}`.trim()
    : "Le bénéficiaire";

  const formattedAmount =
    formatCurrency(amount, currency);

  try {
    await createNotification({
      userId: fromUserId,
      tripId,
      type: "reimbursement_rejected",
      title: "Remboursement non reçu",
      message:
        `${rejectedByName} indique ne pas avoir reçu votre remboursement de ${formattedAmount}.`,
      emoji: "❌",
      contextLabel: `Voyage ${trip.title}`,
      referenceType: "reimbursement",
      referenceId: reimbursementId,
    });
  } catch (error) {
    console.error(
      `Erreur création notification reimbursement_rejected pour l'utilisateur ${fromUserId} :`,
      error,
    );
  }
};

const notifyParticipantJoined = async (
  tripId: number,
  joinedUserId: number,
): Promise<void> => {
  const trip =
    await tripRepository.read(tripId);

  if (!trip) {
    return;
  }

  const joinedUser =
    await userRepository.read(
      joinedUserId,
    );

  if (!joinedUser) {
    return;
  }

  const joinedUserName =
    `${joinedUser.firstname} ${joinedUser.lastname}`.trim();

  const members =
    (await tripRepository.findMembersByTrip(
      tripId,
    )) as TripMember[];

  for (const member of members) {
    if (
      Number(member.id) ===
      Number(joinedUserId)
    ) {
      continue;
    }

    try {
      await createNotification({
        userId: member.id,
        tripId,
        type: "participant_joined",
        title: "Nouveau participant",
        message:
          `${joinedUserName} a rejoint le voyage.`,
        emoji: "👤",
        contextLabel:
          `Voyage ${trip.title}`,
        referenceType:
          "participant",
        referenceId:
          joinedUserId,
      });
    } catch (error) {
      console.error(
        `Erreur création notification participant_joined pour l'utilisateur ${member.id} :`,
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
  notifyExpenseUpdated,
  notifyReimbursementPending,
  notifyReimbursementConfirmed,
  notifyReimbursementRejected,
  notifyParticipantJoined,
};