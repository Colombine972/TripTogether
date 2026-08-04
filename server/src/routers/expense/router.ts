const express = require("express");
const router = express.Router();

import { verifyToken } from "../../modules/auth/authActions";
import expenseActions from "../../modules/expense/expenseAction";
import expenseShareActions from "../../modules/expenseShare/expenseShareActions";

router.get("/:id/summary", verifyToken, expenseActions.getSummary);
router.post("/:id/shares", expenseShareActions.create);

router.get("/:id", expenseActions.getExpensesByTrip);
router.post("/:id", verifyToken, expenseActions.add);

router.put("/:id", verifyToken, expenseActions.update);
router.delete("/:id", verifyToken, expenseActions.remove);

export default router;
