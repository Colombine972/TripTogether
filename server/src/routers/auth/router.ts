import express from "express";

import {
  forgotPassword,
  hashPassword,
  login,
  resetPassword,
} from "../../modules/auth/authActions";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.get("/test", (_req, res) => {
  res.status(200).json({
    message: "Auth router OK",
  });
});

router.post("/register", hashPassword, userActions.add);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
