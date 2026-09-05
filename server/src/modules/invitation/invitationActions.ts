import type {
  Request,
  RequestHandler,
} from "express";

import activityService from "../activity/activityService";
import notificationService from "../notification/notificationService";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";

import invitationEmailService from "./invitationEmailService";
import invitationRepository from "./invitationRepository";

/* =========================================================
   UTILITAIRE - UTILISATEUR CONNECTÉ
========================================================= */

const getConnectedUserId = (
  req: Request,
): number => {
  return Number(
    (
      req as Request & {
        auth: {
          sub: string;
        };
      }
    ).auth.sub,
  );
};

/* =========================================================
   LIRE UNE INVITATION
========================================================= */

const read: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const invitationId = Number(
      req.params.id,
    );

    if (
      Number.isNaN(invitationId) ||
      invitationId <= 0
    ) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    const invitation =
      await invitationRepository.select(
        invitationId,
      );

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* =====================================================
       CONTRÔLE DE L'UTILISATEUR CONNECTÉ
    ====================================================== */

    const connectedUserId =
      getConnectedUserId(req);

    if (
      invitation.user_id !==
      connectedUserId
    ) {
      res.status(403).json({
        error:
          "Vous n'êtes pas autorisé à consulter cette invitation",
      });

      return;
    }

    /* =====================================================
       CONTRÔLE DU STATUT
    ====================================================== */

    if (
      invitation.status ===
      "accepted"
    ) {
      res.status(409).json({
        message:
          "Invitation déjà acceptée",
        trip_id: invitation.trip_id,
      });

      return;
    }

    if (
      invitation.status ===
      "refused"
    ) {
      res.status(410).json({
        message:
          "Invitation déjà refusée",
      });

      return;
    }

    res.json(invitation);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LIRE LES INVITATIONS EN ATTENTE
   DE L'UTILISATEUR CONNECTÉ
========================================================= */

const readPending: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const connectedUserId =
      getConnectedUserId(req);

    if (
      Number.isNaN(connectedUserId) ||
      connectedUserId <= 0
    ) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    const invitations =
      await invitationRepository.selectPendingByUser(
        connectedUserId,
      );

    res.status(200).json(invitations);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MODIFIER LE STATUT D'UNE INVITATION
========================================================= */

const edit: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const invitationId = Number(
      req.params.id,
    );

    if (
      Number.isNaN(invitationId) ||
      invitationId <= 0
    ) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    const invitation =
      await invitationRepository.select(
        invitationId,
      );

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* =====================================================
       VALIDATION DU STATUT DEMANDÉ
    ====================================================== */

    const status = req.body.status;

    if (
      status !== "accepted" &&
      status !== "refused"
    ) {
      res.status(400).json({
        error:
          "Statut d'invitation invalide",
      });

      return;
    }

    /* =====================================================
       CONTRÔLE DE L'UTILISATEUR CONNECTÉ
    ====================================================== */

    const connectedUserId =
      getConnectedUserId(req);

    if (
      invitation.user_id !==
      connectedUserId
    ) {
      res.status(403).json({
        error:
          "Vous n'êtes pas autorisé à répondre à cette invitation",
      });

      return;
    }

    /* =====================================================
       INVITATION DÉJÀ TRAITÉE
    ====================================================== */

    if (
      invitation.status !==
      "pending"
    ) {
      res.status(409).json({
        error:
          "Cette invitation a déjà été traitée",
      });

      return;
    }

    /* =====================================================
       MISE À JOUR DU STATUT
    ====================================================== */

    const success =
      await invitationRepository.updateStatus(
        invitationId,
        status,
      );

    if (!success) {
      res.status(500).json({
        error:
          "Erreur lors de la mise à jour de l'invitation",
      });

      return;
    }

    /* =====================================================
       INVITATION ACCEPTÉE
    ====================================================== */

    if (
      status === "accepted" &&
      invitation.user_id
    ) {
      const tripId = Number(
        invitation.trip_id,
      );

      const joinedUserId = Number(
        invitation.user_id,
      );

      /* ===================================================
         NOTIFICATION
      ==================================================== */

      await notificationService.notifyParticipantJoined(
        tripId,
        joinedUserId,
      );

      /* ===================================================
         ACTIVITÉ
      ==================================================== */

      await activityService.createActivity(
        {
          tripId,
          userId: joinedUserId,
          type: "participant_joined",
          title:
            "Nouveau participant",
          message:
            "a rejoint le voyage.",
          referenceType:
            "participant",
          referenceId:
            joinedUserId,
        },
      );
    }

    res.status(200).json({
      message:
        status === "accepted"
          ? "Invitation acceptée avec succès"
          : "Invitation refusée avec succès",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   AJOUTER UNE INVITATION
========================================================= */

const add: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const tripId = Number(
      req.params.id,
    );

    if (
      Number.isNaN(tripId) ||
      tripId <= 0
    ) {
      res.status(400).json({
        error:
          "ID du voyage invalide",
      });

      return;
    }

    /* =====================================================
       EMAIL
    ====================================================== */

    const email =
      typeof req.body.email ===
      "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "";

    const message =
      typeof req.body.message ===
      "string"
        ? req.body.message.trim()
        : "";

    if (!email) {
      res.status(400).json({
        error: "Email requis",
      });

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({
        error:
          "Format email invalide",
      });

      return;
    }

    /* =====================================================
       VOYAGE
    ====================================================== */

    const trip =
      await tripRepository.read(
        tripId,
      );

    if (!trip) {
      res.status(404).json({
        error:
          "Voyage introuvable",
      });

      return;
    }

    /* =====================================================
       UTILISATEUR INVITÉ
    ====================================================== */

    const existingUser =
      await userRepository.findByEmail(
        email,
      );

    const userId =
      existingUser?.id ?? null;

    /* =====================================================
       CRÉATION DE L'INVITATION
    ====================================================== */

    const invitationId =
      await invitationRepository.create(
        tripId,
        email,
        message,
        userId,
      );

    /* =====================================================
       LIEN D'INVITATION
    ====================================================== */

    const clientUrl =
      process.env.CLIENT_URL ??
      "http://localhost:3000";

    const invitationLink =
      `${clientUrl}/trip/${tripId}` +
      `/invitation/${invitationId}`;

    /* =====================================================
       EMAIL D'INVITATION
    ====================================================== */

    let emailSent = false;

    try {
      await invitationEmailService.sendTripInvitationEmail(
        {
          recipientEmail: email,

          invitedFirstname:
            existingUser?.firstname ??
            null,

          organizerFirstname:
            trip.owner_firstname ??
            "Un organisateur",

          organizerLastname:
            trip.owner_lastname ??
            null,

          tripId,

          invitationId,

          tripTitle:
            trip.title,

          city:
            trip.city,

          country:
            trip.country,

          startAt:
            trip.start_at,

          endAt:
            trip.end_at,

          message:
            message || null,

          placeId:
            trip.place_id ?? null,
        },
      );

      emailSent = true;

      console.log(
        `Email d'invitation envoyé à ${email}`,
      );
    } catch (emailError) {
      console.error(
        `Invitation ${invitationId} créée mais email non envoyé à ${email} :`,
        emailError,
      );
    }

    res.status(201).json({
      invitationId,
      invitationLink,
      emailSent,

      message: emailSent
        ? "Invitation créée et email envoyé avec succès"
        : "Invitation créée mais email non envoyé",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LISTER LES INVITATIONS D'UN VOYAGE
========================================================= */

const selectInvitationsByTrip: RequestHandler =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const tripId = Number(
        req.params.id,
      );

      if (
        Number.isNaN(tripId) ||
        tripId <= 0
      ) {
        res.status(400).json({
          error:
            "ID de voyage invalide",
        });

        return;
      }

      const trip =
        await tripRepository.read(
          tripId,
        );

      if (!trip) {
        res.status(404).json({
          error:
            "Voyage introuvable",
        });

        return;
      }

      const invitations =
        await invitationRepository.selectByTrip(
          tripId,
        );

      res.json({
        trip: {
          id:
            trip.id,

          title:
            trip.title,

          description:
            trip.description,

          start_at:
            trip.start_at,

          end_at:
            trip.end_at,

          user_id:
            trip.user_id,

          owner_firstname:
            trip.owner_firstname,

          owner_lastname:
            trip.owner_lastname,

          owner_avatar_url:
            trip.owner_avatar_url,

          image_url:
            trip.image_url,
        },

        invitations,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   SUPPRIMER UNE INVITATION / UN PARTICIPANT
========================================================= */

const delate: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const tripId = Number(
      req.params.tripId,
    );

    const userId = Number(
      req.params.userId,
    );

    if (
      Number.isNaN(tripId) ||
      Number.isNaN(userId)
    ) {
      res.status(400).json({
        message:
          "Paramètres invalides",
      });

      return;
    }

    const success =
      await invitationRepository.deleteInvitation(
        tripId,
        userId,
      );

    if (!success) {
      res.sendStatus(404);

      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  edit,
  read,
  readPending,
  add,
  selectInvitationsByTrip,
  delate,
};