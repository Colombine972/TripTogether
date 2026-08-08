import type { Request, RequestHandler } from "express";
import type { Trip, TripStatus } from "../../types/tripType";
import invitationRepository from "../invitation/invitationRepository";
import notificationService from "../notification/notificationService";
import tripRepository from "./tripRepository";

type AuthRequest = Request & {
  auth: {
    sub: string;
  };
};

interface RequestWithAuth extends Request {
  auth: {
    sub: string;
  };
}

type TripChange = {
  field:
    | "title"
    | "description"
    | "destination"
    | "start_at"
    | "end_at"
    | "local_currency"
    | "base_currency";
  label: string;
  oldValue?: string | null;
  newValue?: string | null;
};

const normalizeValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeDate = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, "0");

    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const stringValue = String(value).trim();

  const directDateMatch = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (directDateMatch) {
    return `${directDateMatch[1]}-${directDateMatch[2]}-${directDateMatch[3]}`;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return stringValue;
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildTripChanges = (
  previousTrip: Trip,
  updatedTrip: Trip,
): TripChange[] => {
  const changes: TripChange[] = [];

  const previousTitle = normalizeValue(previousTrip.title);

  const updatedTitle = normalizeValue(updatedTrip.title);

  if (previousTitle !== updatedTitle) {
    changes.push({
      field: "title",
      label: "le titre",
      oldValue: previousTitle,
      newValue: updatedTitle,
    });
  }

  const previousDescription = normalizeValue(previousTrip.description);

  const updatedDescription = normalizeValue(updatedTrip.description);

  if (previousDescription !== updatedDescription) {
    changes.push({
      field: "description",
      label: "la description",
    });
  }

  const previousDestination = [
    normalizeValue(previousTrip.city),
    normalizeValue(previousTrip.country),
  ]
    .filter(Boolean)
    .join(", ");

  const updatedDestination = [
    normalizeValue(updatedTrip.city),
    normalizeValue(updatedTrip.country),
  ]
    .filter(Boolean)
    .join(", ");

  if (previousDestination !== updatedDestination) {
    changes.push({
      field: "destination",
      label: "la destination",
      oldValue: previousDestination,
      newValue: updatedDestination,
    });
  }

  const previousStart = normalizeDate(previousTrip.start_at);

  const updatedStart = normalizeDate(updatedTrip.start_at);

  if (previousStart !== updatedStart) {
    changes.push({
      field: "start_at",
      label: "la date de départ",
      oldValue: previousStart,
      newValue: updatedStart,
    });
  }

  const previousEnd = normalizeDate(previousTrip.end_at);

  const updatedEnd = normalizeDate(updatedTrip.end_at);

  if (previousEnd !== updatedEnd) {
    changes.push({
      field: "end_at",
      label: "la date de retour",
      oldValue: previousEnd,
      newValue: updatedEnd,
    });
  }

  const previousLocalCurrency = normalizeValue(previousTrip.local_currency);

  const updatedLocalCurrency = normalizeValue(updatedTrip.local_currency);

  if (previousLocalCurrency !== updatedLocalCurrency) {
    changes.push({
      field: "local_currency",
      label: "la devise locale",
      oldValue: previousLocalCurrency,
      newValue: updatedLocalCurrency,
    });
  }

  const previousBaseCurrency = normalizeValue(previousTrip.base_currency);

  const updatedBaseCurrency = normalizeValue(updatedTrip.base_currency);

  if (previousBaseCurrency !== updatedBaseCurrency) {
    changes.push({
      field: "base_currency",
      label: "la devise du budget",
      oldValue: previousBaseCurrency,
      newValue: updatedBaseCurrency,
    });
  }

  return changes;
};

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const trips = await tripRepository.readAll();

    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const browseTheTrip: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as unknown as RequestWithAuth;

    const userId = Number(authReq.auth.sub);

    const status = (req.query.status as TripStatus) || "futur";

    const trips = await tripRepository.readByUser(userId, status);

    res.json(trips);
  } catch (err) {
    next(err);
  }
};

const browseMyTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    const trip = await tripRepository.read(tripId);

    if (trip == null) {
      res.sendStatus(404);
      return;
    }

    const participants = await invitationRepository.readParticipate(tripId);

    res.json({
      ...trip,
      participants,
    });
  } catch (err) {
    next(err);
  }
};

const delate: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const affectedRows = await tripRepository.delete(id);

    if (affectedRows === 0) {
      res.status(404).send("Voyage non trouvé");
    } else {
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const trip = await tripRepository.readTripInfo(id);

    if (!trip) {
      res.sendStatus(404);
      return;
    }

    res.json(trip);
  } catch (err) {
    next(err);
  }
};

const count: RequestHandler = async (_req, res, next) => {
  try {
    const countTrips = await tripRepository.countTrips();

    res.json(countTrips);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthRequest;

  try {
    if (!authReq.auth) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    const {
      title,
      description,
      city,
      country,
      country_code,
      local_currency,
      base_currency,
      start_at,
      end_at,
      place_id,
    } = req.body;

    if (!title || !description || !city || !country || !start_at || !end_at) {
      res.status(400).json({
        error: "Tous les champs sont obligatoires",
      });

      return;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const startDate = new Date(start_at);

    const endDate = new Date(end_at);

    if (startDate < today) {
      res.status(400).json({
        error: "La date de départ ne peut pas être dans le passé",
      });

      return;
    }

    if (endDate <= startDate) {
      res.status(400).json({
        error: "La date de retour doit être après le départ",
      });

      return;
    }

    const newTrip: Trip = {
      title,
      description,
      city,
      country,
      country_code,
      local_currency,
      base_currency,
      start_at,
      end_at,
      user_id: Number(authReq.auth.sub),
      place_id: place_id || null,
    };

    const insertId = await tripRepository.create(newTrip);

    res.status(201).json({
      insertId,
      message: "Voyage créé avec succès",
      place_id: newTrip.place_id,
    });
  } catch (err) {
    next(err);
  }
};

const getMembersByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({
        error: "ID invalide",
      });

      return;
    }

    const members = await tripRepository.findMembersByTrip(tripId);

    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;

    const tripId = Number(req.params.id);

    const userId = Number(authReq.auth.sub);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      res.status(400).json({
        error: "Identifiant du voyage invalide",
      });

      return;
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
      });

      return;
    }

    const previousTrip = await tripRepository.read(tripId);

    if (!previousTrip) {
      res.status(404).json({
        error: "Voyage introuvable",
      });

      return;
    }

    if (Number(previousTrip.user_id) !== userId) {
      res.status(403).json({
        error: "Vous n'êtes pas autorisé à modifier ce voyage",
      });

      return;
    }

    const updatedTrip = await tripRepository.updateTripEdit(
      tripId,
      userId,
      req.body,
    );

    if (!updatedTrip) {
      res.status(404).json({
        error: "Voyage introuvable ou non autorisé",
      });

      return;
    }

    console.log("DATES AVANT :", {
      start_at: previousTrip.start_at,
      end_at: previousTrip.end_at,
    });

    console.log("DATES APRÈS :", {
      start_at: updatedTrip.start_at,
      end_at: updatedTrip.end_at,
    });

    console.log("DATES NORMALISÉES :", {
      previousStart: normalizeDate(previousTrip.start_at),
      updatedStart: normalizeDate(updatedTrip.start_at),
      previousEnd: normalizeDate(previousTrip.end_at),
      updatedEnd: normalizeDate(updatedTrip.end_at),
    });

    const changes = buildTripChanges(previousTrip, updatedTrip);

    if (changes.length > 0) {
      await notificationService.notifyTripUpdated(tripId, userId, changes);
    }

    res.status(200).json(updatedTrip);
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  browseTheTrip,
  browseMyTrip,
  read,
  delate,
  add,
  count,
  getMembersByTrip,
  edit,
};
