import type { RequestHandler } from "express";
import type { UserType } from "../../types/userType";
import userRepository from "./userRepository";
import invitationRepository from "../invitation/invitationRepository";
import userService from "./userService";

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
    /* =====================================================
       DONNÉES UTILISATEUR
    ====================================================== */

    const firstname =
      typeof req.body.firstname === "string" ? req.body.firstname.trim() : "";

    const lastname =
      typeof req.body.lastname === "string" ? req.body.lastname.trim() : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const hashedPassword =
      typeof req.body.hashed_password === "string"
        ? req.body.hashed_password
        : "";

    /* =====================================================
       CHAMPS OBLIGATOIRES
    ====================================================== */

    if (!firstname || !lastname || !email || !hashedPassword) {
      res.status(400).json({
        message: "Tous les champs sont obligatoires.",
      });

      return;
    }

    /* =====================================================
       EMAIL DÉJÀ UTILISÉ
    ====================================================== */

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      res.status(409).json({
        message: "Un compte existe déjà avec cette adresse e-mail.",
      });

      return;
    }

    /* =====================================================
       CRÉATION DU COMPTE
    ====================================================== */

    const newUser = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    };

    const insertId = await userRepository.create(newUser);

    /* =====================================================
       RATTACHEMENT DES INVITATIONS EXISTANTES
    ====================================================== */

    await invitationRepository.updateUserId(insertId, email);

    /* =====================================================
       SUCCÈS
    ====================================================== */

    res.status(201).json({
      insertId,
    });
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

const exportMyData: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const userId = Number(req.auth.sub);

    const exportData = await userService.exportUserData(userId);

    const fileName = `triptogether-my-data-${
      new Date().toISOString().split("T")[0]
    }.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
};

const deleteMyAccount: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }

    const userId = Number(req.auth.sub);

    await userService.deleteMyAccount(userId);

    res.status(200).json({
      message:
        "Votre compte a été supprimé définitivement. Vos données personnelles ont été supprimées et les données nécessaires ont été conservées de manière anonymisée.",
    });
  } catch (error) {
    next(error);
  }
};

const changePassword: RequestHandler = async (req, res) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const userId = Number(req.auth.sub);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Tous les champs sont obligatoires" });
      return;
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur changePassword :", error);

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
};

export default {
  browse,
  read,
  add,
  updateMe,
  exportMyData,
  deleteMyAccount,
  changePassword,
};
