import type { Request, RequestHandler } from "express";

import activityService from "../activity/activityService";
import notificationService from "../notification/notificationService";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";

import invitationEmailService from "./invitationEmailService";
import invitationRepository from "./invitationRepository";

/* =========================================================
   UTILITAIRE - UTILISATEUR CONNECTÉ
========================================================= */

const getConnectedUserId = (req: Request): number => {
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
   UTILITAIRE - DATE DE FIN DU VOYAGE
========================================================= */

const getTripEndDate = (value: string | Date | undefined): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const date = new Date(value);

    date.setHours(23, 59, 59, 999);

    return date;
  }

  const datePart = String(value).slice(0, 10);

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

/* =========================================================
   LIRE UNE INVITATION
   ANCIEN PARCOURS PAR ID
========================================================= */

const read: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);

    if (Number.isNaN(invitationId) || invitationId <= 0) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    const invitation = await invitationRepository.select(invitationId);

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* =====================================================
       CONTRÔLE DE L'UTILISATEUR CONNECTÉ
    ====================================================== */

    const connectedUserId = getConnectedUserId(req);

    if (invitation.user_id !== connectedUserId) {
      res.status(403).json({
        error: "Vous n'êtes pas autorisé à consulter cette invitation",
      });

      return;
    }

    /* =====================================================
       CONTRÔLE DU STATUT
    ====================================================== */

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Invitation déjà acceptée",

        trip_id: invitation.trip_id,
      });

      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Invitation déjà refusée",
      });

      return;
    }

    res.status(200).json(invitation);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LIRE UNE INVITATION PUBLIQUE PAR TOKEN
========================================================= */

const readPublic: RequestHandler = async (req, res, next) => {
  try {
    const publicToken =
      typeof req.params.token === "string" ? req.params.token.trim() : "";

    if (!publicToken) {
      res.status(400).json({
        error: "Token d'invitation invalide",
      });

      return;
    }

    const invitation =
      await invitationRepository.readByPublicToken(publicToken);

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* ===================================================
         INVITATION DÉJÀ TRAITÉE
      =================================================== */

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Cette invitation a déjà été acceptée",

        trip_id: invitation.trip_id,
      });

      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Cette invitation a déjà été refusée",
      });

      return;
    }

    /* ===================================================
         VOYAGE TERMINÉ
      =================================================== */

    const tripEndDate = getTripEndDate(invitation.trip_end);

    if (tripEndDate && tripEndDate < new Date()) {
      res.status(410).json({
        message: "Cette invitation a expiré car le voyage est terminé",
      });

      return;
    }

    /* ===================================================
         COMPTE EXISTANT ?
      =================================================== */

    let hasAccount = false;

    if (invitation.email) {
      const existingUser = await userRepository.findByEmail(invitation.email);

      hasAccount = Boolean(existingUser);
    }

    /* ===================================================
         RÉPONSE PUBLIQUE
         NE PAS RENVOYER L'EMAIL
      =================================================== */

    res.status(200).json({
      invitation: {
        publicToken: invitation.public_token,

        status: invitation.status,

        hasAccount,

        trip: {
          id: invitation.trip_id,

          title: invitation.trip_title,

          city: invitation.trip_city,

          country: invitation.trip_country,

          startAt: invitation.trip_start,

          endAt: invitation.trip_end,

          placeId: invitation.trip_place_id,
        },

        organizer: {
          firstname: invitation.creator_firstname,

          lastname: invitation.creator_lastname,

          avatarUrl: invitation.creator_avatar_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LIRE UNE INVITATION PAR TOKEN
   POUR UN UTILISATEUR AUTHENTIFIÉ
========================================================= */

const readAccess: RequestHandler = async (req, res, next) => {
  try {
    const publicToken =
      typeof req.params.token === "string" ? req.params.token.trim() : "";

    if (!publicToken) {
      res.status(400).json({
        error: "Token d'invitation invalide",
      });

      return;
    }

    /* ===================================================
         UTILISATEUR CONNECTÉ
      =================================================== */

    const connectedUserId = getConnectedUserId(req);

    if (Number.isNaN(connectedUserId) || connectedUserId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    /* ===================================================
         RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ
      =================================================== */

    const connectedUser =
      await invitationRepository.findUserById(connectedUserId);

    if (!connectedUser) {
      res.status(401).json({
        error: "Utilisateur introuvable",
      });

      return;
    }

    /* ===================================================
         RÉCUPÉRATION DE L'INVITATION
      =================================================== */

    const invitation =
      await invitationRepository.readByPublicToken(publicToken);

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* ===================================================
         CONTRÔLE DU STATUT
      =================================================== */

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Cette invitation a déjà été acceptée.",

        trip_id: invitation.trip_id,
      });

      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Cette invitation a déjà été refusée.",
      });

      return;
    }

    /* ===================================================
         VOYAGE TERMINÉ
      =================================================== */

    const tripEndDate = getTripEndDate(invitation.trip_end);

    if (tripEndDate && tripEndDate < new Date()) {
      res.status(410).json({
        message: "Cette invitation a expiré car le voyage est terminé.",
      });

      return;
    }

    /* ===================================================
         CONTRÔLE DE L'EMAIL
      =================================================== */

    const connectedEmail = connectedUser.email.trim().toLowerCase();

    const invitationEmail = invitation.email?.trim().toLowerCase();

    if (!invitationEmail || invitationEmail !== connectedEmail) {
      res.status(403).json({
        error: "Cette invitation appartient à un autre utilisateur.",
      });

      return;
    }

    /* ===================================================
         NOUVEL UTILISATEUR
         RATTACHEMENT DE L'INVITATION
      =================================================== */

    if (invitation.user_id === null) {
      await invitationRepository.updateUserId(connectedUserId, connectedEmail);

      invitation.user_id = connectedUserId;

      /*
       * Comme l'invitation a été chargée
       * avant le rattachement, les champs
       * invited_* peuvent être absents.
       *
       * Ce n'est pas bloquant pour le parcours.
       */
    }

    /* ===================================================
         SÉCURITÉ FINALE
      =================================================== */

    if (invitation.user_id !== connectedUserId) {
      res.status(403).json({
        error: "Cette invitation appartient à un autre utilisateur.",
      });

      return;
    }

    /* ===================================================
         RÉPONSE PRIVÉE
      =================================================== */

    res.status(200).json({
      id: invitation.id,

      status: invitation.status,

      trip_id: invitation.trip_id,

      message: invitation.message,

      trip_title: invitation.trip_title,

      trip_start: invitation.trip_start,

      trip_end: invitation.trip_end,

      trip_city: invitation.trip_city,

      trip_country: invitation.trip_country,

      trip_place_id: invitation.trip_place_id,

      creator_firstname: invitation.creator_firstname,

      creator_lastname: invitation.creator_lastname,

      creator_avatar_url: invitation.creator_avatar_url,

      invited_firstname: invitation.invited_firstname,

      invited_lastname: invitation.invited_lastname,

      invited_avatar_url: invitation.invited_avatar_url,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   LIRE LES INVITATIONS EN ATTENTE
   DE L'UTILISATEUR CONNECTÉ
========================================================= */

const readPending: RequestHandler = async (req, res, next) => {
  try {
    const connectedUserId = getConnectedUserId(req);

    if (Number.isNaN(connectedUserId) || connectedUserId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    const invitations =
      await invitationRepository.selectPendingByUser(connectedUserId);

    res.status(200).json(invitations);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MODIFIER LE STATUT D'UNE INVITATION
========================================================= */

const edit: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);

    if (Number.isNaN(invitationId) || invitationId <= 0) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    const invitation = await invitationRepository.select(invitationId);

    if (!invitation) {
      res.status(404).json({
        error: "Invitation introuvable",
      });

      return;
    }

    /* ===================================================
         VALIDATION DU STATUT
      =================================================== */

    const status = req.body.status;

    if (status !== "accepted" && status !== "refused") {
      res.status(400).json({
        error: "Statut d'invitation invalide",
      });

      return;
    }

    /* ===================================================
         CONTRÔLE UTILISATEUR
      =================================================== */

    const connectedUserId = getConnectedUserId(req);

    if (invitation.user_id !== connectedUserId) {
      res.status(403).json({
        error: "Vous n'êtes pas autorisé à répondre à cette invitation",
      });

      return;
    }

    /* ===================================================
         DÉJÀ TRAITÉE
      =================================================== */

    if (invitation.status !== "pending") {
      res.status(409).json({
        error: "Cette invitation a déjà été traitée",
      });

      return;
    }

    /* ===================================================
         MISE À JOUR
      =================================================== */

    const success = await invitationRepository.updateStatus(
      invitationId,
      status,
    );

    if (!success) {
      res.status(500).json({
        error: "Erreur lors de la mise à jour de l'invitation",
      });

      return;
    }

    /* ===================================================
         INVITATION ACCEPTÉE
      =================================================== */

    if (status === "accepted" && invitation.user_id) {
      const tripId = Number(invitation.trip_id);

      const joinedUserId = Number(invitation.user_id);

      /* =================================================
           NOTIFICATION
        ================================================= */

      await notificationService.notifyParticipantJoined(tripId, joinedUserId);

      /* =================================================
           ACTIVITÉ
        ================================================= */

      await activityService.createActivity({
        tripId,
        userId: joinedUserId,
        type: "participant_joined",
        title: "Nouveau participant",
        message: "a rejoint le voyage.",
        referenceType: "participant",
        referenceId: joinedUserId,
      });
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

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId) || tripId <= 0) {
      res.status(400).json({
        error: "ID du voyage invalide",
      });

      return;
    }

    /* ===================================================
         EMAIL
      =================================================== */

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!email) {
      res.status(400).json({
        error: "Email requis",
      });

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Format email invalide",
      });

      return;
    }

    /* ===================================================
         VOYAGE
      =================================================== */

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      res.status(404).json({
        error: "Voyage introuvable",
      });

      return;
    }

    /* ===================================================
         UTILISATEUR INVITÉ
      =================================================== */

    const existingUser = await userRepository.findByEmail(email);

    const userId = existingUser?.id ?? null;

    /* ===================================================
         CRÉATION
      =================================================== */

    const { invitationId, publicToken } = await invitationRepository.create(
      tripId,
      email,
      message,
      userId,
    );

    /* ===================================================
         LIEN
      =================================================== */

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

    const invitationLink = `${clientUrl}/invitation/${publicToken}`;

    /* ===================================================
         EMAIL
      =================================================== */

    let emailSent = false;

    try {
      await invitationEmailService.sendTripInvitationEmail({
        recipientEmail: email,

        invitedFirstname: existingUser?.firstname ?? null,

        organizerFirstname: trip.owner_firstname ?? "Un organisateur",

        organizerLastname: trip.owner_lastname ?? null,

        invitationLink,

        tripTitle: trip.title,

        city: trip.city,

        country: trip.country,

        startAt: trip.start_at,

        endAt: trip.end_at,

        message: message || null,

        placeId: trip.place_id ?? null,
      });

      emailSent = true;

      console.log(`Email d'invitation envoyé à ${email}`);
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

const selectInvitationsByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId) || tripId <= 0) {
      res.status(400).json({
        error: "ID de voyage invalide",
      });

      return;
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      res.status(404).json({
        error: "Voyage introuvable",
      });

      return;
    }

    const invitations = await invitationRepository.selectByTrip(tripId);

    res.json({
      trip: {
        id: trip.id,

        title: trip.title,

        description: trip.description,

        start_at: trip.start_at,

        end_at: trip.end_at,

        user_id: trip.user_id,

        owner_firstname: trip.owner_firstname,

        owner_lastname: trip.owner_lastname,

        owner_avatar_url: trip.owner_avatar_url,

        image_url: trip.image_url,
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

const delate: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);

    const userId = Number(req.params.userId);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({
        message: "Paramètres invalides",
      });

      return;
    }

    const success = await invitationRepository.deleteInvitation(tripId, userId);

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
  readPublic,
  readAccess,
  readPending,
  add,
  selectInvitationsByTrip,
  delate,
};
