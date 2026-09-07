import express from "express";
import { verifyToken } from "../../modules/auth/authActions";
import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";
import stepActions from "../../modules/step/stepActions";
import tripActions from "../../modules/trip/tripActions";
import userPaymentPreferenceActions from "../../modules/userPaymentPreference/userPaymentPreferenceActions";
import verifyTripMember from "../../modules/trip/verifyTripMember";

const router = express.Router();

router.get("/count", tripActions.count);
router.get("/info/:id", tripActions.read);

router.get("/:id/members", tripActions.getMembersByTrip);

router.get(
  "/:tripId/participants/:participantId/payment-preferences",
  verifyToken,
  userPaymentPreferenceActions.getForTripParticipant,
);

router.get("/countries", tripActions.browse);
router.get("/", tripActions.browse);

router.get(
  "/:id",
  verifyToken,
  verifyTripMember,
  tripActions.browseMyTrip,
);

router.post("/:id/invitations", invitationActions.add);

router.post("/", verifyToken, tripActions.add);
router.put("/:id", verifyToken, tripActions.edit);
router.delete("/:id", verifyToken, tripActions.delate);
router.delete(
  "/:tripId/steps/:stepId",
  verifyToken,
  verifyTripMember,
  stepActions.deleteStep,
);

router.get("/:id/invitations", invitationActions.selectInvitationsByTrip);
router.get(
  "/:tripId/invitation/:id",
  invitationServices.checkExpirationDate,
  invitationActions.read,
);
router.patch("/:tripId/invitation/:id", invitationActions.edit);

router.get(
  "/:tripId/steps",
  verifyToken,
  verifyTripMember,
  stepActions.selectStepsByTrip,
);
router.post(
  "/:tripId/steps",
  verifyToken,
  verifyTripMember,
  stepActions.addStepCity,
);
router.get(
  "/:tripId/steps/:id/votes",
  verifyToken,
  verifyTripMember,
  stepActions.browseVote,
);

router.post(
  "/:tripId/steps/:id/votes",
  verifyToken,
  verifyTripMember,
  stepActions.addVote,
);

export default router;
