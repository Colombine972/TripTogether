import type { RequestHandler } from "express";
import Joi from "joi";
import type { StepWithStatus, VotesStats } from "../../types/voteType";
import * as googlePlacesService from "../services/googlePlacesService";
import tripRepository from "../trip/tripRepository";
import stepRepository from "./stepRepository";

type RequestWithAuth = import("express").Request & {
  auth: {
    sub: string;
  };
};

const createVoteSchema = Joi.object({
  vote: Joi.boolean().required(),
  comment: Joi.string().max(500).allow(null, "").optional(),
});

const selectStepsByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "ID de voyage invalide" });
    }

    const authReq = req as RequestWithAuth;
    const userId = Number(authReq.auth.sub);
    if (!userId) {
      return res.status(403).json({ error: "Non authentifié" });
    }

    const trip = await tripRepository.read(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Voyage introuvable" });
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
      if (step.is_initial) {
        return {
          id: step.id,
          city: step.city,
          country: step.country,
          creator_name: step.creator_name,
          trip_id: step.trip_id,
          image_url: step.image_url,
          is_initial: step.is_initial,
          status: "validated" as const,
          voteStats: {
            yes: step.total_members,
            no: step.total_votes,
            total: step.yes_votes,
          },
        };
      }

      const yesVotes = step.yes_votes;
      const totalVotes = step.total_votes;
      const memberCount = step.total_members;

      const everyoneVoted = totalVotes === memberCount;
      const majorityYes = yesVotes > memberCount / 2;

      let status: "pending" | "validated" | "rejected" = "pending";

      if (everyoneVoted) {
        status = majorityYes ? "validated" : "rejected";
      }

      return {
        id: step.id,
        city: step.city,
        country: step.country,
        image_url: step.image_url,
        creator_name: step.creator_name,
        trip_id: step.trip_id,
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

const addVote: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number(req.params.id);

    if (Number.isNaN(stepId)) {
      return res.status(400).json({ error: "ID d'étape invalide" });
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

    if (!userId) {
      return res.status(403).json({ error: "Non authentifié" });
    }

    const step = await stepRepository.getStepWithTrip(stepId);
    if (!step) {
      return res.status(404).json({ error: "Etape non trouvée" });
    }

    const isMemberOfTrip = await tripRepository.isUserMemberOfTrip(
      step.trip_id,
      userId,
    );
    if (!isMemberOfTrip) {
      return res.status(403).json({
        error: "Vous devez être membre du voyage pour voter",
      });
    }

    const hasVoted = await stepRepository.hasUserVoted(userId, stepId);
    if (hasVoted) {
      return res.status(409).json({
        error: "Vous avez déjà voté pour cette étape",
      });
    }

    const voteId = await stepRepository.create(
      userId,
      stepId,
      vote,
      comment || null,
    );

    const createdVote = await stepRepository.selectByIdWithUser(voteId);

    return res.status(201).json(createdVote);
  } catch (err) {
    next(err);
  }
};

const browseVote: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number(req.params.id);

    const authReq = req as RequestWithAuth;
    const userId = Number(authReq.auth.sub);

    if (!userId) {
      return res.status(403).json({ error: "Non authentifié" });
    }

    if (Number.isNaN(stepId)) {
      return res.status(400).json({ error: "ID d'étape invalide" });
    }

    const step = await stepRepository.getStepWithTrip(stepId);
    if (!step) {
      return res.status(404).json({ error: "Etape non trouvée" });
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

    const yes = allVotes.filter((v) => v.vote).length;
    const no = allVotes.filter((v) => !v.vote).length;

    const showVoteStats: VotesStats = {
      step_id: stepId,
      allVotes,
      summary: {
        yes,
        no,
        total: allVotes.length,
      },
    };

    return res.status(200).json(showVoteStats);
  } catch (err) {
    next(err);
  }
};
const deleteStep: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number(req.params.stepId);
    const tripId = Number(req.params.tripId);
    const authReq = req as RequestWithAuth;
    const userId = Number(authReq.auth.sub);
    // Vérifier si l'étape existe
    const step = await stepRepository.getStepWithTrip(stepId);
    if (!step) return res.status(404).json({ error: "Étape introuvable" });
    // Vérifier que l'utilisateur est bien le propriétaire du voyage
    const isOwner = await tripRepository.isOwner(tripId, userId);
    if (!isOwner) return res.status(403).json({ error: "Non autorisé" });
    await stepRepository.delete(stepId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
const addStepCity: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "ID de voyage invalide" });
    }
    const authReq = req as RequestWithAuth;
    const userId = Number(authReq.auth.sub);
    if (!userId) {
      return res.status(403).json({ error: "Non authentifié" });
    }
    const trip = await tripRepository.read(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Voyage introuvable" });
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
    const { city, country, image_url } = req.body;
    if (typeof city !== "string" || typeof country !== "string") {
      return res
        .status(400)
        .json({ error: "La ville et le pays sont requis." });
    }
    let finalImageUrl = image_url;
    if (!finalImageUrl) {
      finalImageUrl = await googlePlacesService.getCityImage(city, country);
    }
    const stepId = await stepRepository.createStepCity({
      trip_id: tripId,
      city,
      country,
      image_url: finalImageUrl || "/images/default-city.jpg",
      user_id: userId,
    });
    return res.status(201).json({
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        city: trip.city,
        country: trip.country,
        image_url: trip.image_url,
      },
      step: {
        id: stepId,
        city,
        country,
        image_url: finalImageUrl || "/images/default-city.jpg",
        trip_id: tripId,
        creator_name: "Vous",
        status: "pending",
        voteStats: { yes: 0, no: 0, total: 0 },
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  selectStepsByTrip,
  addVote,
  browseVote,
  addStepCity,
  deleteStep,
};
