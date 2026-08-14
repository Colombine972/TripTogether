import type {
  NextFunction,
  Request,
  Response,
} from "express";

import tripRepository from "../trip/tripRepository";

import activityService from "./activityService";
import activityRepository from "./activityRepository";

type AuthenticatedRequest =
  Request & {
    auth?: {
      sub?:
        | number
        | string;
    };
  };

const browseByTrip = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tripId =
      Number(
        req.params.tripId,
      );

    const userId =
      Number(
        req.auth?.sub,
      );

    if (
      !Number.isInteger(
        tripId,
      ) ||
      tripId <= 0
    ) {
      res.status(400).json({
        error:
          "ID du voyage invalide.",
      });

      return;
    }

    if (
      !Number.isInteger(
        userId,
      ) ||
      userId <= 0
    ) {
      res.status(401).json({
        error:
          "Utilisateur non authentifié.",
      });

      return;
    }

    const isMember =
      await tripRepository.isUserMemberOfTrip(
        tripId,
        userId,
      );

    if (!isMember) {
      res.status(403).json({
        error:
          "Vous devez être membre du voyage pour consulter son activité.",
      });

      return;
    }

    const requestedLimit =
      Number(
        req.query.limit,
      );

    const limit =
      Number.isInteger(
        requestedLimit,
      ) &&
      requestedLimit > 0
        ? Math.min(
            requestedLimit,
            50,
          )
        : 10;

    const activities =
      await activityRepository.findByTripId(
        tripId,
        limit,
      );

    res.status(200).json({
      activities,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  browseByTrip,
};