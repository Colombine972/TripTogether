const express = require("express");

const router = express.Router();

import invitationActions from "../../modules/invitation/invitationActions";

import invitationServices from "../../modules/invitation/invitationServices";

import { verifyToken } from "../../modules/auth/authActions";

/* =========================================================
   LECTURE PUBLIQUE D'UNE INVITATION PAR TOKEN
   UTILISATEUR NON CONNECTÉ / NON ENREGISTRÉ
========================================================= */

router.get(
  "/public/:token",
  invitationActions.readPublic,
);


/* =========================================================
   INVITATION PAR TOKEN - UTILISATEUR CONNECTÉ
========================================================= */

router.get(
  "/access/:token",
  verifyToken,
  invitationActions.readAccess,
);

/* =========================================================
   INVITATIONS EN ATTENTE DE L'UTILISATEUR CONNECTÉ
========================================================= */

router.get(
  "/pending",

  verifyToken,

  invitationActions.readPending,
);

/* =========================================================
   LECTURE D'UNE INVITATION
   UTILISATEUR CONNECTÉ
========================================================= */

router.get(
  "/:id",

  verifyToken,

  invitationServices.checkExpirationDate,

  invitationActions.read,
);

/* =========================================================
   ACCEPTATION / REFUS
========================================================= */

router.patch(
  "/:id",

  verifyToken,

  invitationActions.edit,
);

/* =========================================================
   SUPPRESSION D'UN PARTICIPANT / INVITATION
========================================================= */

router.delete(
  "/:tripId/:userId",

  verifyToken,

  invitationActions.delate,
);

export default router;