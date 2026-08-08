import { getIo } from "../socket/socket";

export type RealtimeNotification = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  trip_id?: number | null;
};

const sendNotification = (
  userId: number,
  notification: RealtimeNotification,
): void => {
  const io = getIo();

  io.to(`user:${userId}`).emit(
    "notification:new",
    notification,
  );
};

const refreshNotifications = (userId: number): void => {
  const io = getIo();

  io.to(`user:${userId}`).emit(
    "notification:refresh",
  );
};

export default {
  sendNotification,
  refreshNotifications,
};