import express from "express";
import { verifyToken } from "../../modules/auth/authActions";
import * as authActions from "../../modules/auth/authActions";
import tripActions from "../../modules/trip/tripActions";
import userActions from "../../modules/user/userActions";

const router = express.Router();

router.post("/", authActions.hashPassword, userActions.add);
router.get("/my-trips", verifyToken, tripActions.browseTheTrip);
router.get("/", userActions.browse);
router.get("/:id", userActions.read);

export default router;
