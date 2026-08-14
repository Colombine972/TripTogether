import express from "express";

import activityRouter from "../activity/router";
import authRouter from "../auth/router";
import exchangeRateRouter from "../exchangeRate/router";
import expenseRouter from "../expense/router";
import expenseCategoryRouter from "../expenseCategory/router";
import invitationRouter from "../invitation/router";
import notificationRouter from "../notification/router";
import placesRouter from "../places/router";
import preferencesRouter from "../preferences/router";
import reimbursementRouter from "../reimbursement/router";
import tripRouter from "../trip/router";
import userRouter from "../user/router";
import userPaymentPreferenceRouter from "../userPaymentPreference/router";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/invitation", invitationRouter);

router.use("/trips", tripRouter);

router.use("/users/preferences", preferencesRouter);

router.use("/users/payment-preferences", userPaymentPreferenceRouter);

router.use("/users", userRouter);

router.use("/expenses", expenseRouter);

router.use("/reimbursements", reimbursementRouter);

router.use("/categories", expenseCategoryRouter);

router.use("/notifications", notificationRouter);

router.use("/activities", activityRouter);

router.use("/places", placesRouter);

router.use("/exchange-rates", exchangeRateRouter);

export default router;
