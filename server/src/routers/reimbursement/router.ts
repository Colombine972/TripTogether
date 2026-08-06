import express from "express";
import { verifyToken } from "../../modules/auth/authActions";
import reimbursementActions from "../../modules/reimbursement/reimbursementActions";

const router = express.Router();

router.post("/", verifyToken, reimbursementActions.add);

router.get(
  "/trip/:tripId",
  verifyToken,
  reimbursementActions.browseByTrip,
);

router.patch(
  "/:id/confirm",
  verifyToken,
  reimbursementActions.confirm,
);

router.patch(
  "/:id/reject",
  verifyToken,
  reimbursementActions.reject,
);

export default router;