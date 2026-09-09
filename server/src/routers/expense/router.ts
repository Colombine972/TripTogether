const express = require("express");

const router = express.Router();

import { verifyToken } from "../../modules/auth/authActions";
import verifyTripMember from "../../modules/trip/verifyTripMember";

import expenseActions from "../../modules/expense/expenseAction";
import expenseShareActions from "../../modules/expenseShare/expenseShareActions";

router.get(
  "/:id/summary",
  verifyToken,
  verifyTripMember,
  expenseActions.getSummary,
);

router.post(
  "/:id/shares",
  verifyToken,
  verifyTripMember,
  expenseShareActions.create,
);

router.get(
  "/:id",
  verifyToken,
  verifyTripMember,
  expenseActions.getExpensesByTrip,
);

router.post("/:id", verifyToken, verifyTripMember, expenseActions.add);

router.put(
  "/:tripId/:expenseId",
  verifyToken,
  verifyTripMember,
  expenseActions.update,
);

router.delete(
  "/:tripId/:expenseId",
  verifyToken,
  verifyTripMember,
  expenseActions.remove,
);

export default router;
