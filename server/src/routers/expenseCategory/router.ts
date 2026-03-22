import express from "express";
import expenseCategoryActions from "../../modules/expenseCategory/expenseCategoryActions";

const router = express.Router();

router.get("/", expenseCategoryActions.browse);

export default router;