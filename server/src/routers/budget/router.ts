const express = require("express");
const router = express.Router();

import { verifyToken } from "../../modules/auth/authActions";
import budgetActions from "../../modules/budget/budgetAction";
import expenseShareActions from "../../modules/expenseShare/expenseShareActions";

router.get("/:id/summary", verifyToken, budgetActions.getSummary);
router.get("/:id/budget", budgetActions.read);
router.post("/:id/shares", expenseShareActions.create);

router.get("/:id", budgetActions.getExpensesByTrip);
router.post("/:id", verifyToken, budgetActions.add);

router.delete("/:id", verifyToken, budgetActions.remove);

export default router;
