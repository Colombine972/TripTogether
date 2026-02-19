import type { RequestHandler } from "express";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";
import invitationRepository from "./invitationRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const invitation = await invitationRepository.select(invitationId);

    if (!invitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Invitation déjà acceptée",
        trip_id: invitation.trip_id,
      });
      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Invitation déjà refusée",
      });
      return;
    }

    res.json(invitation);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);
    const updateInvitation = await invitationRepository.select(invitationId);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    if (!updateInvitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    const success = await invitationRepository.updateStatus(
      invitationId,
      req.body.status,
    );

    if (!success) {
      res.status(500).json({ error: "Erreur mise à jour" });
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { email, message } = req.body;
    const existingUser = await userRepository.findByEmail(email);

    const user_id = existingUser ? existingUser.id : null;

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    if (!email || !message) {
      res.status(400).json({ error: "Email et message requis" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Format email invalide" });
      return;
    }

    const invitationId = await invitationRepository.create(
      tripId,
      email,
      message,
      user_id,
    );

    const invitationLink = `http://localhost:3000/trip/${tripId}/invitation/${invitationId}`;

    res.status(201).json({ invitationLink });
  } catch (err) {
    next(err);
  }
};

const selectInvitationsByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID de voyage invalide" });
      return;
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      res.status(404).json({ error: "Voyage introuvable" });
      return;
    }

    const invitations = await invitationRepository.selectByTrip(tripId);

    res.json({
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        start_at: trip.start_at,
        end_at: trip.end_at,
        user_id: trip.user_id,
        owner_firstname: trip.owner_firstname,
        owner_lastname: trip.owner_lastname,
        image_url: trip.image_url,
      },
      invitations,
    });
  } catch (err) {
    next(err);
  }
};

const delate: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = Number(req.params.userId);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({ message: "Paramètres invalides" });
      return;
    }

    const success = await invitationRepository.deleteInvitation(tripId, userId);

    if (!success) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { edit, read, add, selectInvitationsByTrip, delate };
