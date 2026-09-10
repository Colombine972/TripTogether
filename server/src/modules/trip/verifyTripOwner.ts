import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { JwtPayload } from "jsonwebtoken";

import tripRepository from "./tripRepository";

interface MyPayload extends JwtPayload {
  sub: string;
}

type RequestWithAuth = Request & {
  auth: MyPayload;
};

const verifyTripOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as RequestWithAuth;

    const userId = Number(
      authenticatedReq.auth?.sub,
    );

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        message: "Utilisateur non authentifié",
      });

      return;
    }

    const tripId = Number(
      req.params.tripId ??
        req.params.id ??
        req.body.trip_id ??
        req.query.tripId,
    );

    if (!Number.isInteger(tripId) || tripId <= 0) {
      res.status(400).json({
        message: "Identifiant du voyage invalide",
      });

      return;
    }

    const tripExists =
      await tripRepository.exists(tripId);

    if (!tripExists) {
      res.status(404).json({
        message:
          "Ce voyage n'existe pas ou n'est plus disponible.",
      });

      return;
    }

    const isOwner =
      await tripRepository.isOwner(
        tripId,
        userId,
      );

    if (!isOwner) {
      res.status(403).json({
        message:
          "Seul l'organisateur peut effectuer cette action.",
      });

      return;
    }

    next();
  } catch (error) {
    console.error(
      "Erreur verifyTripOwner :",
      error,
    );

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

export default verifyTripOwner;