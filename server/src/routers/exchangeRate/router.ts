import express from "express";
import exchangeRateActions from "../../modules/exchangeRate/exchangeRateAction";

const router = express.Router();

router.get("/", exchangeRateActions.getRate);

export default router;



