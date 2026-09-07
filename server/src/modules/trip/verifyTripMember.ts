import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import tripRepository from "../../modules/trip/tripRepository";

interface MyPayload extends JwtPayload {
  sub: string;
}

type RequestWithAuth = Request & {
  auth: MyPayload;
};

const verifyTripMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as RequestWithAuth;

    const userId = Number(authenticatedReq.auth?.sub);

    if (!userId || Number.isNaN(userId)) {
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

    if (!tripId || Number.isNaN(tripId)) {
      res.status(400).json({
        message: "Identifiant du voyage invalide",
      });
      return;
    }

    const isMember = await tripRepository.isUserMemberOfTrip(
      tripId,
      userId,
    );

    if (!isMember) {
      res.status(403).json({
        message: "Vous n'avez pas accès à ce voyage",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Erreur verifyTripMember :", error);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

export default verifyTripMember;