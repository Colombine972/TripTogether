import express from "express";

import { verifyToken } from "../../modules/auth/authActions";

import * as authActions from "../../modules/auth/authActions";

import tripActions from "../../modules/trip/tripActions";

import userActions from "../../modules/user/userActions";

const router = express.Router();

/* =========================================================
   INSCRIPTION
========================================================= */

router.post("/", authActions.hashPassword, userActions.add);

/* =========================================================
   VOYAGES DE L'UTILISATEUR CONNECTÉ
========================================================= */

router.get("/my-trips", verifyToken, tripActions.browseTheTrip);

/* =========================================================
   UTILISATEURS
========================================================= */

router.get("/", verifyToken, userActions.browse);

router.get("/:id", verifyToken, userActions.read);

/* =========================================================
   COMPTE DE L'UTILISATEUR CONNECTÉ
========================================================= */

router.put("/me", verifyToken, userActions.updateMe);

router.get("/me/export", verifyToken, userActions.exportMyData);

router.delete("/me", verifyToken, userActions.deleteMyAccount);

router.put("/change-password", verifyToken, userActions.changePassword);

export default router;
