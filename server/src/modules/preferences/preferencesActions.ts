import type { Request, RequestHandler } from "express";
import preferencesService from "./preferencesService";

type AuthenticatedRequest = Request & {
  auth: {
    sub: string;
  };
};

const browse: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number((req as AuthenticatedRequest).auth.sub);

    if (!userId) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const preferences = await preferencesService.getUserPreferences(userId);

    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number((req as AuthenticatedRequest).auth.sub);

    if (!userId) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const { email_trip_notifications } = req.body;

    if (typeof email_trip_notifications !== "boolean") {
      res.status(400).json({
        message: "Le champ email_trip_notifications doit être un booléen.",
      });
      return;
    }

    const updatedPreferences = await preferencesService.updateUserPreferences(
      userId,
      email_trip_notifications,
    );

    res.status(200).json(updatedPreferences);
  } catch (error) {
    next(error);
  }
};

export default {
  browse,
  edit,
};