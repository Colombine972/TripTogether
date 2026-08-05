const express = require("express");

const router = express.Router();

import { verifyToken } from "../../modules/auth/authActions";
import userPaymentPreferenceActions from "../../modules/userPaymentPreference/userPaymentPreferenceActions";

router.get(
  "/",
  verifyToken,
  userPaymentPreferenceActions.get,
);

router.put(
  "/",
  verifyToken,
  userPaymentPreferenceActions.update,
);

export default router;