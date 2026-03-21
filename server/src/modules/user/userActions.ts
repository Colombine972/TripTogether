import type { RequestHandler } from "express";
import type { UserType } from "../../types/userType";
import userRepository from "./userRepository";
import invitationRepository from "../invitation/invitationRepository";

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const users = await userRepository.readAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await userRepository.read(id);

    if (!user) {
      res.sendStatus(404);
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const newUser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.hashed_password,
    };

    const insertId = await userRepository.create(newUser);
    await invitationRepository.updateUserId(insertId, req.body.email);
    res.status(201).json({ insertId });
  } catch (err) {
    next(err);
  }
};

const updateMe: RequestHandler = async (req, res) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }

    const userId = Number(req.auth.sub);

    const { firstname, lastname, email, avatar_url } = req.body;

    if (!firstname || !lastname || !email) {
      res.status(400).json({ error: "Champs manquants" });
      return;
    }

    await userRepository.update(userId, {
      firstname,
      lastname,
      email,
      avatar_url,
    });

    res.json({
      id: userId,
      firstname,
      lastname,
      email,
      avatar_url,
    });
  } catch (error) {
    console.error("Erreur updateMe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export default { browse, read, add, updateMe };
