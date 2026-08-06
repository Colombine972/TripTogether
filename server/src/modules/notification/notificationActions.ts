import type { NextFunction, Request, Response } from "express";
import notificationService from "./notificationService";

type AuthenticatedRequest = Request & {
  auth?: {
    sub?: number | string;
    id?: number | string;
    userId?: number | string;
  };
  user?: {
    id?: number | string;
  };
};

const getAuthenticatedUserId = (
  req: AuthenticatedRequest,
): number | null => {
  const rawUserId =
    req.auth?.sub ??
    req.auth?.userId ??
    req.auth?.id ??
    req.user?.id;

  if (rawUserId === undefined || rawUserId === null) {
    return null;
  }

  const userId = Number(rawUserId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
};

const browse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });

      return;
    }

    const notifications =
      await notificationService.getUserNotifications(userId);

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const unreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });

      return;
    }

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      count,
    });
  } catch (error) {
    next(error);
  }
};

const read = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });

      return;
    }

    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      res.status(400).json({
        message: "Identifiant de notification invalide.",
      });

      return;
    }

    await notificationService.markAsRead(
      notificationId,
      userId,
    );

    res.status(200).json({
      message: "Notification marquée comme lue.",
    });
  } catch (error) {
    next(error);
  }
};

const readAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      res.status(401).json({
        message: "Utilisateur non authentifié.",
      });

      return;
    }

    const updatedCount =
      await notificationService.markAllAsRead(userId);

    res.status(200).json({
      message: "Toutes les notifications ont été marquées comme lues.",
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  browse,
  unreadCount,
  read,
  readAll,
};