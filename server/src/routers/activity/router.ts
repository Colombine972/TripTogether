import express from "express";

import { verifyToken } from "../../modules/auth/authActions";
import activityActions from "../../modules/activity/activityActions";

const router =
  express.Router();

router.get(
  "/:tripId",
  verifyToken,
  activityActions.browseByTrip,
);

export default router;