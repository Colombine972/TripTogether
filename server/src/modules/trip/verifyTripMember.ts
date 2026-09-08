import type {
  NextFunction,
  Request,
  Response,
} from "express";
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
    /* =====================================================
       UTILISATEUR CONNECTÉ
    ====================================================== */

    const authenticatedReq =
      req as RequestWithAuth;

    const userId = Number(
      authenticatedReq.auth?.sub,
    );

    if (!userId || Number.isNaN(userId)) {
      res.status(401).json({
        message:
          "Utilisateur non authentifié",
      });

      return;
    }

    /* =====================================================
       IDENTIFIANT DU VOYAGE
    ====================================================== */

    const tripId = Number(
      req.params.tripId ??
        req.params.id ??
        req.body.trip_id ??
        req.query.tripId,
    );

    if (!tripId || Number.isNaN(tripId)) {
      res.status(400).json({
        message:
          "Identifiant du voyage invalide",
      });

      return;
    }

    /* =====================================================
       LE VOYAGE EXISTE-T-IL ?
    ====================================================== */

    const tripExists =
      await tripRepository.exists(tripId);

    if (!tripExists) {
      res.status(404).json({
        message:
          "Ce voyage n'existe pas ou n'est plus disponible.",
      });

      return;
    }

    /* =====================================================
       L'UTILISATEUR A-T-IL ACCÈS AU VOYAGE ?
    ====================================================== */

    const isMember =
      await tripRepository.isUserMemberOfTrip(
        tripId,
        userId,
      );

    if (!isMember) {
      res.status(403).json({
        message:
          "Vous n'avez pas accès à ce voyage",
      });

      return;
    }

    /* =====================================================
       ACCÈS AUTORISÉ
    ====================================================== */

    next();
  } catch (error) {
    console.error(
      "Erreur verifyTripMember :",
      error,
    );

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

export default verifyTripMember;