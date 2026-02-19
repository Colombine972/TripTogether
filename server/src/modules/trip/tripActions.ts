import type { Request, RequestHandler } from "express";
import type { Trip, TripStatus } from "../../types/tripType";
import invitationRepository from "../invitation/invitationRepository";
import * as googlePlacesService from "../services/googlePlacesService";
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

    res.json({ ...trip, participants });
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
    const trip = await tripRepository.readTripInfo(Number(id));
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
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const { title, description, city, country, start_at, end_at, image_url } =
      req.body;

    if (!title || !description || !city || !country || !start_at || !end_at) {
      res.status(400).json({ error: "Tous les champs sont obligatoires" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    if (startDate < today) {
      res
        .status(400)
        .json({ error: "La date de départ ne peut pas être dans le passé" });
      return;
    }
    if (endDate <= startDate) {
      res
        .status(400)
        .json({ error: "La date de retour doit être après le départ" });
      return;
    }

    let finalImageUrl = image_url;
    if (!finalImageUrl) {
      finalImageUrl = await googlePlacesService.getCityImage(city, country);
    }

    const newTrip: Trip = {
      title,
      description,
      city,
      country,
      start_at,
      end_at,
      user_id: Number(authReq.auth.sub),
      image_url: finalImageUrl || "/images/default-city.jpg",
    };

    const insertId = await tripRepository.create(newTrip);

    res.status(201).json({
      insertId,
      message: "Voyage créé avec succès",
      image_url: newTrip.image_url,
    });
  } catch (err) {
    next(err);
  }
};

const getMembersByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const members = await tripRepository.findMembersByTrip(tripId);

    res.status(200).json(members);
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
};
