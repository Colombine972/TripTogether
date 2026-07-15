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

    if (!userId || Number.isNaN(userId)) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });
      return;
    }

    const preferences =
      await preferencesService.getUserPreferences(userId);

    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number((req as AuthenticatedRequest).auth.sub);

    if (!userId || Number.isNaN(userId)) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });
      return;
    }

    const {
      email_trip_notifications,
      default_currency,
    } = req.body;

    if (typeof email_trip_notifications !== "boolean") {
      res.status(400).json({
        message:
          "Le champ email_trip_notifications doit être un booléen.",
      });
      return;
    }

    if (
      typeof default_currency !== "string" ||
      default_currency.trim().length !== 3
    ) {
      res.status(400).json({
        message:
          "Le champ default_currency doit être un code devise de 3 caractères.",
      });
      return;
    }

    const normalizedCurrency = default_currency
      .trim()
      .toUpperCase();

    const updatedPreferences =
      await preferencesService.updateUserPreferences(
        userId,
        email_trip_notifications,
        normalizedCurrency,
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