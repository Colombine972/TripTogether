const express = require("express");

const router = express.Router();

import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";
import { verifyToken } from "../../modules/auth/authActions";

router.get(
  "/:id",
  verifyToken,
  invitationServices.checkExpirationDate,
  invitationActions.read,
);

router.patch("/:id", verifyToken, invitationActions.edit);

router.delete("/:tripId/:userId", invitationActions.delate);

export default router;
