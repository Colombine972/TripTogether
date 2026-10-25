import type { RequestHandler } from "express";
import Joi from "joi";

import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

import type { StepWithStatus, VotesStats } from "../../types/voteType";

import activityService from "../activity/activityService";
import notificationService from "../notification/notificationService";
import tripRepository from "../trip/tripRepository";

import stepRepository from "./stepRepository";

type RequestWithAuth = import("express").Request & {
  auth: {
    sub: string;
  };
};

/* =========================================================
   VALIDATION VOTE
========================================================= */

const createVoteSchema = Joi.object({
  vote: Joi.boolean().required(),

  comment: Joi.string().max(500).allow(null, "").optional(),
});

/* =========================================================
   VALIDATION ÉTAPE
========================================================= */

const createStepSchema = Joi.object({
  city: Joi.string().trim().min(1).required(),

  country: Joi.string().trim().min(1).required(),

  place_id: Joi.string().trim().allow(null, "").optional(),

  start_at: Joi.date().iso().required(),

  end_at: Joi.date().iso().required(),
});

/* =========================================================
   RÉCUPÉRER LES ÉTAPES DU VOYAGE
========================================================= */

const selectStepsByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({
        error: "ID de voyage invalide",
      });
    }

    const authReq = req as RequestWithAuth;

    const userId = Number(authReq.auth.sub);

    if (!userId) {
      return res.status(403).json({
        error: "Non authentifié",
      });
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      return res.status(404).json({
        error: "Voyage introuvable",
      });
    }

    const isMemberOfTrip = await tripRepository.isUserMemberOfTrip(
      tripId,
      userId,
    );

    if (!isMemberOfTrip) {
      return res.status(403).json({
        error: "Vous devez être membre du voyage pour voir les étapes",
      });
    }

    const steps = await stepRepository.getStepsWithVotes(tripId);

    const stepsWithStatus: StepWithStatus[] = steps.map((step) => {
      /* =============================================
               DESTINATION PRINCIPALE
            ============================================== */

      if (step.is_initial) {
        return {
          id: step.id,

          city: step.city,

          country: step.country,

          start_at: step.start_at,

          end_at: step.end_at,

          creator_name: step.creator_name,

          trip_id: step.trip_id,

          place_id: step.place_id,

          is_initial: step.is_initial,

          status: "validated" as const,

          voteStats: {
            yes: step.total_members,

            no: step.total_votes - step.yes_votes,

            total: step.total_votes,
          },
        };
      }

      /* =============================================
         STATUT DE LA DESTINATION PROPOSÉE
         Les votes restent ouverts jusqu'au départ
      ============================================== */

      /* =============================================
         STATUT ET RÉSULTATS DES VOTES
      ============================================== */

      let yesVotes = Number(step.yes_votes);
      let totalVotes = Number(step.total_votes);
      let noVotes = totalVotes - yesVotes;

      let status: "pending" | "validated" | "rejected" | "no_decision" =
        "pending";

      // Résultat déjà finalisé et enregistré en MySQL
      if (step.vote_finalized_at && step.vote_status) {
        status = step.vote_status as "validated" | "rejected" | "no_decision";

        yesVotes = Number(step.final_yes_votes ?? 0);
        noVotes = Number(step.final_no_votes ?? 0);
        totalVotes = yesVotes + noVotes;
      }

      // Dans tous les autres cas, le statut reste pending.
      // La finalisation sera assurée par le backend.

      return {
        id: step.id,

        city: step.city,

        country: step.country,

        start_at: step.start_at,

        end_at: step.end_at,

        place_id: step.place_id,

        creator_name: step.creator_name,

        trip_id: step.trip_id,

        is_initial: step.is_initial,

        status,

        voteStats: {
          yes: yesVotes,

          no: totalVotes - yesVotes,

          total: totalVotes,
        },
      };
    });

    return res.status(200).json({
      trip: {
        id: trip.id,

        title: trip.title,

        description: trip.description,

        memberCount: steps[0]?.total_members ?? 0,
      },

      steps: stepsWithStatus,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   VÉRIFIER SI LES VOTES SONT ENCORE OUVERTS
   Fuseau horaire : Europe/Paris
========================================================= */

const isVoteOpen = (tripStartDate: string | Date): boolean => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const toParisDate = (date: Date): string => {
    const parts = formatter.formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  const startDate =
    typeof tripStartDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(tripStartDate)
      ? tripStartDate
      : toParisDate(new Date(tripStartDate));

  const todayInParis = toParisDate(new Date());

  // Les votes ferment dès minuit le jour du départ.
  return todayInParis < startDate;
};

/* =========================================================
   AJOUTER OU MODIFIER UN VOTE
   TRANSACTION MYSQL
========================================================= */

const addVote: RequestHandler = async (req, res, next) => {
  const stepId = Number(req.params.id);

  if (!Number.isInteger(stepId) || stepId <= 0) {
    return res.status(400).json({
      error: "ID d'étape invalide",
    });
  }

  const { error, value } = createVoteSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const { vote, comment } = value;

  const authReq = req as RequestWithAuth;
  const userId = Number(authReq.auth.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({
      error: "Non authentifié",
    });
  }

  const connection = await databaseClient.getConnection().catch(next);

  if (!connection) return;

  let committedVote: Rows[number] | null = null;
  let isFirstVote = false;
  let tripId = 0;
  let stepCity = "";

  try {
    await connection.beginTransaction();

    /* =====================================================
       RETROUVER LE VOYAGE DE L'ÉTAPE
    ====================================================== */

    const [stepLookup] = await connection.query<Rows>(
      `
        SELECT trip_id
        FROM step
        WHERE id = ?
      `,
      [stepId],
    );

    if (stepLookup.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Étape introuvable",
      });
    }

    tripId = Number(stepLookup[0].trip_id);

    /* =====================================================
       VERROUILLER LE VOYAGE
    ====================================================== */

    const [trips] = await connection.query<Rows>(
      `
        SELECT
          id,
          user_id,
          DATE_FORMAT(start_at, '%Y-%m-%d') AS start_date
        FROM trip
        WHERE id = ?
        FOR UPDATE
      `,
      [tripId],
    );

    if (trips.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Voyage introuvable",
      });
    }

    /* =====================================================
       VERROUILLER LA DESTINATION
    ====================================================== */

    const [steps] = await connection.query<Rows>(
      `
        SELECT
          id,
          trip_id,
          city,
          is_initial,
          vote_status
        FROM step
        WHERE id = ?
          AND trip_id = ?
        FOR UPDATE
      `,
      [stepId, tripId],
    );

    if (steps.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Destination introuvable",
      });
    }

    const step = steps[0];
    stepCity = String(step.city);

    if (Number(step.is_initial) !== 0) {
      await connection.rollback();
      return res.status(403).json({
        error: "La destination principale est automatiquement validée.",
      });
    }

    /* =====================================================
       VÉRIFIER LE STATUT DE LA DESTINATION
    ====================================================== */

    // NULL : ancienne destination non encore migrée.
    // Ce cas devra être traité lors de l'initialisation
    // des données existantes.

    if (step.vote_status !== "pending") {
      await connection.rollback();
      return res.status(403).json({
        error: "Le vote de cette destination est terminé.",
      });
    }

    /* =====================================================
       VÉRIFIER L'APPARTENANCE AU VOYAGE
    ====================================================== */

    const [members] = await connection.query<Rows>(
      `
        SELECT
          (
            EXISTS (
              SELECT 1
              FROM trip t
              WHERE t.id = ?
                AND t.user_id = ?
            )
            OR EXISTS (
              SELECT 1
              FROM invitation i
              WHERE i.trip_id = ?
                AND i.user_id = ?
                AND i.status = 'accepted'
            )
          ) AS is_member
      `,
      [tripId, userId, tripId, userId],
    );

    if (Number(members[0]?.is_member) !== 1) {
      await connection.rollback();
      return res.status(403).json({
        error: "Vous devez être membre du voyage pour voter",
      });
    }

    /* =====================================================
       VÉRIFIER LA DATE LIMITE
       EUROPE/PARIS
    ====================================================== */

    const tripStartDate = String(trips[0].start_date);

    if (!isVoteOpen(tripStartDate)) {
      await connection.rollback();
      return res.status(403).json({
        error: "Les votes sont clôturés pour ce voyage.",
      });
    }

    /* =====================================================
       RECHERCHER LE VOTE DE L'UTILISATEUR
    ====================================================== */

    const [existingVotes] = await connection.query<Rows>(
      `
        SELECT id
        FROM vote
        WHERE user_id = ?
          AND step_id = ?
        FOR UPDATE
      `,
      [userId, stepId],
    );

    let voteId: number;

    if (existingVotes.length > 0) {
      voteId = Number(existingVotes[0].id);

      await connection.query<Result>(
        `
          UPDATE vote
          SET
            vote = ?,
            comment = ?
          WHERE id = ?
        `,
        [vote ? 1 : 0, comment || null, voteId],
      );
    } else {
      const [result] = await connection.query<Result>(
        `
          INSERT INTO vote
            (user_id, step_id, vote, comment)
          VALUES (?, ?, ?, ?)
        `,
        [userId, stepId, vote ? 1 : 0, comment || null],
      );

      voteId = result.insertId;
      isFirstVote = true;
    }

    /* =====================================================
       RÉCUPÉRER LE VOTE ENREGISTRÉ
    ====================================================== */

    const [savedVotes] = await connection.query<Rows>(
      `
        SELECT
          v.*,
          u.firstname AS user_name
        FROM vote v
        JOIN user u
          ON u.id = v.user_id
        WHERE v.id = ?
      `,
      [voteId],
    );

    committedVote = savedVotes[0] ?? null;

    await connection.commit();
  } catch (err) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Erreur rollback du vote :", rollbackError);
    }

    return next(err);
  } finally {
    connection.release();
  }

  /* =====================================================
     NOTIFICATION UNIQUEMENT AU PREMIER VOTE
     APRÈS VALIDATION DE LA TRANSACTION
  ====================================================== */

  if (isFirstVote) {
    try {
      await notificationService.notifyVoteCreated(
        tripId,
        userId,
        stepId,
        stepCity,
      );

      await activityService.createActivity({
        tripId,
        userId,
        type: "vote_created",
        title: "Nouveau vote",
        message: vote
          ? `a voté Oui pour l'étape ${stepCity}.`
          : `a voté Non pour l'étape ${stepCity}.`,
        referenceType: "step",
        referenceId: stepId,
      });
    } catch (notificationError) {
      console.error(
        "Vote enregistré, mais erreur de notification :",
        notificationError,
      );
    }
  }

  return res.status(isFirstVote ? 201 : 200).json(committedVote);
};

/* =========================================================
   RÉCUPÉRER LES VOTES
========================================================= */

const browseVote: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number(req.params.id);

    const authReq = req as RequestWithAuth;

    const userId = Number(authReq.auth.sub);

    if (!userId) {
      return res.status(403).json({
        error: "Non authentifié",
      });
    }

    if (Number.isNaN(stepId)) {
      return res.status(400).json({
        error: "ID d'étape invalide",
      });
    }

    const step = await stepRepository.getStepWithTrip(stepId);

    if (!step) {
      return res.status(404).json({
        error: "Etape non trouvée",
      });
    }

    const isMemberOfTrip = await tripRepository.isUserMemberOfTrip(
      step.trip_id,
      userId,
    );

    if (!isMemberOfTrip) {
      return res.status(403).json({
        error: "Vous devez être membre du voyage pour voir les votes",
      });
    }

    const allVotes = await stepRepository.selectByStep(stepId);

    const isFinalized = step.vote_finalized_at != null;

    const yes = isFinalized
      ? Number(step.final_yes_votes ?? 0)
      : allVotes.filter((currentVote) => Number(currentVote.vote) === 1).length;

    const no = isFinalized
      ? Number(step.final_no_votes ?? 0)
      : allVotes.filter((currentVote) => Number(currentVote.vote) === 0).length;

    const showVoteStats: VotesStats = {
      step_id: stepId,
      allVotes,
      summary: {
        yes,
        no,
        total: yes + no,
      },
    };

    return res.status(200).json(showVoteStats);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   SUPPRIMER UNE ÉTAPE
========================================================= */

const deleteStep: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number(req.params.stepId);
    const tripId = Number(req.params.tripId);

    const authReq = req as RequestWithAuth;
    const userId = Number(authReq.auth.sub);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        error: "ID de voyage invalide",
      });
    }

    if (!Number.isInteger(stepId) || stepId <= 0) {
      return res.status(400).json({
        error: "ID d'étape invalide",
      });
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: "Non authentifié",
      });
    }

    const step = await stepRepository.getStepWithTrip(stepId);

    if (!step) {
      return res.status(404).json({
        error: "Étape introuvable",
      });
    }

    /* Vérifie que l'étape appartient bien au voyage de l'URL */
    if (Number(step.trip_id) !== tripId) {
      return res.status(404).json({
        error: "Étape introuvable pour ce voyage",
      });
    }

    /* Seul l'organisateur peut supprimer une étape */
    const isOwner = await tripRepository.isOwner(tripId, userId);

    if (!isOwner) {
      return res.status(403).json({
        error: "Non autorisé",
      });
    }

    await stepRepository.delete(stepId);

    return res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   AJOUTER UNE ÉTAPE
========================================================= */

const addStepCity: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({
        error: "ID de voyage invalide",
      });
    }

    const authReq = req as RequestWithAuth;

    const userId = Number(authReq.auth.sub);

    if (!userId) {
      return res.status(403).json({
        error: "Non authentifié",
      });
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      return res.status(404).json({
        error: "Voyage introuvable",
      });
    }

    const isMemberOfTrip = await tripRepository.isUserMemberOfTrip(
      tripId,
      userId,
    );

    if (!isMemberOfTrip) {
      return res.status(403).json({
        error: "Vous devez être membre du voyage pour ajouter une étape",
      });
    }

    /* =====================================================
         VALIDATION
      ====================================================== */

    const { error, value } = createStepSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { city, country, place_id, start_at, end_at } = value;

    /*
     * Joi transforme les dates ISO
     * en objets Date.
     */
    const stepStartDate = new Date(start_at);

    const stepEndDate = new Date(end_at);

    const tripStartDate = new Date(trip.start_at);

    const tripEndDate = new Date(trip.end_at);

    /* =====================================================
         DATE DE FIN >= DATE DE DÉBUT
      ====================================================== */

    if (stepEndDate < stepStartDate) {
      return res.status(400).json({
        error:
          "La date de fin de l'étape doit être postérieure ou égale à la date de début.",
      });
    }

    /* =====================================================
         ÉTAPE COMPRISE DANS LE VOYAGE
      ====================================================== */

    if (stepStartDate < tripStartDate || stepEndDate > tripEndDate) {
      return res.status(400).json({
        error:
          "Les dates de l'étape doivent être comprises dans les dates du voyage.",
      });
    }

    const formatSqlDate = (date: Date) => date.toISOString().slice(0, 10);

    const formattedStartAt = formatSqlDate(stepStartDate);

    const formattedEndAt = formatSqlDate(stepEndDate);

    /* =====================================================
         CRÉATION
      ====================================================== */

    const stepId = await stepRepository.createStepCity({
      trip_id: tripId,

      city,

      country,

      start_at: formattedStartAt,

      end_at: formattedEndAt,

      place_id: place_id || null,

      user_id: userId,
    });

    /* =====================================================
         ACTIVITÉ
      ====================================================== */

    await activityService.createActivity({
      tripId,

      userId,

      type: "step_created",

      title: "Nouvelle étape proposée",

      message: `a proposé ${city} comme nouvelle étape.`,

      referenceType: "step",

      referenceId: stepId,
    });

    return res.status(201).json({
      trip: {
        id: trip.id,

        title: trip.title,

        description: trip.description,

        city: trip.city,

        country: trip.country,

        place_id: trip.place_id,
      },

      step: {
        id: stepId,

        city,

        country,

        start_at: formattedStartAt,

        end_at: formattedEndAt,

        place_id: place_id || null,

        trip_id: tripId,

        creator_name: "Vous",

        is_initial: false,

        status: "pending",

        voteStats: {
          yes: 0,

          no: 0,

          total: 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  selectStepsByTrip,
  addVote,
  browseVote,
  addStepCity,
  deleteStep,
};
