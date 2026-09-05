const express = require("express");

const router = express.Router();

import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";
import { verifyToken } from "../../modules/auth/authActions";

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