import express from "express";
import preferencesActions from "../../modules/preferences/preferencesActions";
import { verifyToken } from "../../modules/auth/authActions";

const router = express.Router();

router.get("/", verifyToken, preferencesActions.browse);
router.put("/", verifyToken, preferencesActions.edit);

export default router;