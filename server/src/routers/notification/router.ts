import express from "express";
import notificationActions from "../../modules/notification/notificationActions";
import { verifyToken } from "../../modules/auth/authActions";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  notificationActions.browse,
);

router.get(
  "/unread-count",
  verifyToken,
  notificationActions.unreadCount,
);

router.patch(
  "/read-all",
  verifyToken,
  notificationActions.readAll,
);

router.patch(
  "/:id/read",
  verifyToken,
  notificationActions.read,
);

export default router;