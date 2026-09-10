import express from "express";

import { verifyToken } from "../../modules/auth/authActions";
import activityActions from "../../modules/activity/activityActions";
import verifyTripMember from "../../modules/trip/verifyTripMember";

const router = express.Router();

router.get(
  "/:tripId",
  verifyToken,
  verifyTripMember,
  activityActions.browseByTrip,
);

export default router;