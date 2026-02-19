import express from "express";
import { hashPassword, login } from "../../modules/auth/authActions";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.post("/register", hashPassword, userActions.add);
router.post("/login", login);

export default router;
