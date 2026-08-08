import express from "express";
import { verifyToken } from "../../modules/auth/authActions";
import notificationActions from "../../modules/notification/notificationActions";

const router =
  express.Router();

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

router.delete(
  "/:id",
  verifyToken,
  notificationActions.remove,
);

export default router;