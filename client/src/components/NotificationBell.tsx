import {
  Bell,
  CheckCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { Notification } from "../types/notification";
import "./styles/NotificationBell.css";

function NotificationBell() {
  const navigate = useNavigate();

  const { auth } = useAuth();

  const token =
    auth?.token ||
    localStorage.getItem("token") ||
    "";

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  const getUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de récupérer le nombre de notifications.",
        );
      }

      setUnreadCount(Number(data?.count || 0));
    } catch (error) {
      console.error(
        "Erreur récupération compteur notifications :",
        error,
      );

      setUnreadCount(0);
    }
  }, [token]);

  const getNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de récupérer les notifications.",
        );
      }

      setNotifications(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error,
      );

      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getUnreadCount();
  }, [getUnreadCount]);

  const openPanel = () => {
    setIsOpen(true);

    if (notifications.length === 0) {
      getNotifications();
    }
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const handleBellClick = () => {
    setIsOpen((currentValue) => {
      const nextValue = !currentValue;

      if (
        nextValue &&
        notifications.length === 0
      ) {
        getNotifications();
      }

      return nextValue;
    });
  };

  const markAsRead = async (
    notification: Notification,
  ) => {
    if (!token || notification.is_read) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notification.id}/read`,
        {
          method: "PATCH",
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            "Impossible de marquer la notification comme lue.",
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? {
                ...currentNotification,
                is_read: true,
              }
            : currentNotification,
        ),
      );

      setUnreadCount((currentCount) =>
        Math.max(0, currentCount - 1),
      );
    } catch (error) {
      console.error(
        "Erreur lecture notification :",
        error,
      );
    }
  };

  const handleNotificationClick = async (
    notification: Notification,
  ) => {
    await markAsRead(notification);

    setIsOpen(false);

    if (notification.trip_id) {
      navigate(
        `/trip/${notification.trip_id}/budget`,
      );
    }
  };

  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            "Impossible de marquer les notifications comme lues.",
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Erreur lecture de toutes les notifications :",
        error,
      );
    }
  };

  const formatNotificationDate = (
    createdAt: string,
  ): string => {
    const notificationDate = new Date(createdAt);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const differenceInMilliseconds =
      now.getTime() - notificationDate.getTime();

    const differenceInMinutes = Math.floor(
      differenceInMilliseconds / 60000,
    );

    if (differenceInMinutes < 1) {
      return "À l’instant";
    }

    if (differenceInMinutes < 60) {
      return `Il y a ${differenceInMinutes} min`;
    }

    const differenceInHours = Math.floor(
      differenceInMinutes / 60,
    );

    if (differenceInHours < 24) {
      return `Il y a ${differenceInHours} h`;
    }

    const differenceInDays = Math.floor(
      differenceInHours / 24,
    );

    if (differenceInDays === 1) {
      return "Hier";
    }

    if (differenceInDays < 7) {
      return `Il y a ${differenceInDays} jours`;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
    }).format(notificationDate);
  };

  const visibleNotifications =
    notifications.slice(0, 5);

  return (
    <div
      className="notification-center"
      onMouseEnter={openPanel}
      onMouseLeave={closePanel}
    >
      <button
        type="button"
        className="notification-bell-button"
        onClick={handleBellClick}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-expanded={isOpen}
      >
        <Bell
          size={23}
          strokeWidth={2}
        />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <h3>Notifications</h3>

              {unreadCount > 0 && (
                <span>
                  {unreadCount} non lue
                  {unreadCount > 1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>
          </div>

          <div className="notification-panel-content">
            {isLoading ? (
              <div className="notification-empty">
                Chargement...
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="notification-empty">
                <span>🔔</span>

                <p>
                  Aucune notification pour le moment.
                </p>
              </div>
            ) : (
              visibleNotifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`notification-item ${
                      !notification.is_read
                        ? "notification-item-unread"
                        : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                  >
                    <div className="notification-item-icon">
                      {notification.emoji ||
                        "🔔"}
                    </div>

                    <div className="notification-item-content">
                      <div className="notification-item-title-row">
                        <strong>
                          {notification.title}
                        </strong>

                        {!notification.is_read && (
                          <span
                            className="notification-unread-dot"
                            aria-label="Non lue"
                          />
                        )}
                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <div className="notification-item-meta">
                        {notification.context_label && (
                          <span>
                            {
                              notification.context_label
                            }
                          </span>
                        )}

                        {notification.context_label && (
                          <span aria-hidden="true">
                            ·
                          </span>
                        )}

                        <span>
                          {formatNotificationDate(
                            notification.created_at,
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ),
              )
            )}
          </div>

          {visibleNotifications.length > 0 && (
            <div className="notification-panel-footer">
              <button
                type="button"
                className="notification-mark-all"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck size={17} />

                Tout marquer comme lu
              </button>

              <button
                type="button"
                className="notification-see-all"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications");
                }}
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;