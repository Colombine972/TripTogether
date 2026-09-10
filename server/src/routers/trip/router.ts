import express from "express";

import { verifyToken } from "../../modules/auth/authActions";
import invitationActions from "../../modules/invitation/invitationActions";
import stepActions from "../../modules/step/stepActions";
import tripActions from "../../modules/trip/tripActions";
import userPaymentPreferenceActions from "../../modules/userPaymentPreference/userPaymentPreferenceActions";
import verifyTripMember from "../../modules/trip/verifyTripMember";


const router = express.Router();

/* =========================================================
   STATISTIQUE PUBLIQUE
========================================================= */

router.get(
  "/count",
  tripActions.count,
);

/* =========================================================
   INFORMATIONS D'UN VOYAGE
========================================================= */

router.get(
  "/info/:id",
  verifyToken,
  verifyTripMember,
  tripActions.read,
);

/* =========================================================
   MEMBRES DU VOYAGE
========================================================= */

router.get(
  "/:id/members",
  verifyToken,
  verifyTripMember,
  tripActions.getMembersByTrip,
);

/* =========================================================
   PRÉFÉRENCES DE PAIEMENT
========================================================= */

router.get(
  "/:tripId/participants/:participantId/payment-preferences",
  verifyToken,
  verifyTripMember,
  userPaymentPreferenceActions.getForTripParticipant,
);

/* =========================================================
   LECTURE DU VOYAGE
========================================================= */

router.get(
  "/:id",
  verifyToken,
  verifyTripMember,
  tripActions.browseMyTrip,
);

/* =========================================================
   CRÉATION
========================================================= */

router.post(
  "/",
  verifyToken,
  tripActions.add,
);

/* =========================================================
   MODIFICATION
   Contrôle propriétaire dans tripActions.edit
========================================================= */

router.put(
  "/:id",
  verifyToken,
  tripActions.edit,
);

/* =========================================================
   SUPPRESSION
   Contrôle propriétaire dans tripActions.delate
========================================================= */

router.delete(
  "/:id",
  verifyToken,
  tripActions.delate,
);

/* =========================================================
   INVITATIONS DU VOYAGE
========================================================= */

router.post(
  "/:id/invitations",
  verifyToken,
  verifyTripMember,
  invitationActions.add,
);

router.get(
  "/:id/invitations",
  verifyToken,
  verifyTripMember,
  invitationActions.selectInvitationsByTrip,
);

/* =========================================================
   ÉTAPES
========================================================= */

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

router.delete(
  "/:tripId/steps/:stepId",
  verifyToken,
  verifyTripMember,
  stepActions.deleteStep,
);

/* =========================================================
   VOTES
========================================================= */

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