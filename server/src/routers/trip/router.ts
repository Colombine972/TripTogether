import express from "express";
import { verifyToken } from "../../modules/auth/authActions";
import invitationActions from "../../modules/invitation/invitationActions";
import invitationServices from "../../modules/invitation/invitationServices";
import stepActions from "../../modules/step/stepActions";
import tripActions from "../../modules/trip/tripActions";

const router = express.Router();

router.get("/count", tripActions.count);
router.get("/info/:id", tripActions.read);

router.get("/:id/members", tripActions.getMembersByTrip);

router.get("/countries", tripActions.browse);
router.get("/", tripActions.browse);

router.get("/:id", tripActions.browseMyTrip);

router.post("/:id/invitations", invitationActions.add);

router.post("/", verifyToken, tripActions.add);
router.delete("/:id", verifyToken, tripActions.delate);
router.delete("/:tripId/steps/:stepId", verifyToken, stepActions.deleteStep);

router.get("/:id/invitations", invitationActions.selectInvitationsByTrip);
router.get(
  "/:tripId/invitation/:id",
  invitationServices.checkExpirationDate,
  invitationActions.read,
);
router.patch("/:tripId/invitation/:id", invitationActions.edit);

router.get("/:tripId/steps", verifyToken, stepActions.selectStepsByTrip);
router.post("/:tripId/steps", verifyToken, stepActions.addStepCity);
router.get("/:tripId/steps/:id/votes", verifyToken, stepActions.browseVote);
router.post("/:tripId/steps/:id/votes", verifyToken, stepActions.addVote);

export default router;
