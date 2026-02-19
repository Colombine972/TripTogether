import express from "express";
import authRouter from "../auth/router";
import budgetRouter from "../budget/router";
import invitationRouter from "../invitation/router";
import tripRouter from "../trip/router";
import userRouter from "../user/router";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/invitation", invitationRouter);
router.use("/trips", tripRouter);

router.use("/users", userRouter);

router.use("/expenses", budgetRouter);

export default router;
