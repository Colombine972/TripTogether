import express from "express";
import authRouter from "../auth/router";
import expenseRouter from "../expense/router";
import invitationRouter from "../invitation/router";
import tripRouter from "../trip/router";
import userRouter from "../user/router";
import expenseCategoryRouter from "../expenseCategory/router";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/invitation", invitationRouter);
router.use("/trips", tripRouter);

router.use("/users", userRouter);

router.use("/expenses", expenseRouter);

router.use("/categories", expenseCategoryRouter);

export default router;
