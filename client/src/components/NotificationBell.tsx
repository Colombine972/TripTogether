import { Bell, CheckCheck } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/NotificationBell.css";

type NotificationType =
  | "reimbursement_pending"
  | "reimbursement_confirmed"
  | "reimbursement_rejected"
  | "expense_created"
  | "expense_updated"
  | "participant_joined"
  | "trip_invitation"
  | "trip_updated"
  | "vote_created"
  | "general";

type Notification = {
  id: number;
  user_id: number;
  trip_id: number | null;
  type: NotificationType;
  title: string;
  message: string;
  emoji: string | null;
  context_label: string | null;
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [isOpen, setIsOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const token =
    auth?.token ||
    localStorage.getItem("token") ||
    "";

  const fetchUnreadCount =
    useCallback(async () => {
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

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de récupérer le compteur des notifications.",
          );
        }

        setUnreadCount(
          Number(data?.count || 0),
        );
      } catch (error) {
        console.error(
          "Erreur compteur notifications :",
          error,
        );

        setUnreadCount(0);
      }
    }, [token]);

  const fetchNotifications =
    useCallback(async () => {
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

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de récupérer les notifications.",
          );
        }

        const receivedNotifications: Notification[] =
          Array.isArray(data)
            ? data.map(
                (
                  notification: Notification,
                ) => ({
                  ...notification,
                  is_read:
                    notification.is_read ===
                      true ||
                    Number(
                      notification.is_read,
                    ) === 1,
                }),
              )
            : [];

        setNotifications(
          receivedNotifications,
        );

        setUnreadCount(
          receivedNotifications.filter(
            (notification) =>
              !notification.is_read,
          ).length,
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
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const togglePanel = () => {
    if (!isOpen) {
      fetchNotifications();
    }

    setIsOpen(
      (currentValue) =>
        !currentValue,
    );
  };

  const markAsRead = async (
    notification: Notification,
  ): Promise<void> => {
    if (
      !token ||
      notification.is_read
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notification.id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de marquer cette notification comme lue.",
        );
      }

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (
              currentNotification,
            ) =>
              currentNotification.id ===
              notification.id
                ? {
                    ...currentNotification,
                    is_read: true,
                  }
                : currentNotification,
          ),
      );

      setUnreadCount(
        (currentCount) =>
          Math.max(
            0,
            currentCount - 1,
          ),
      );
    } catch (error) {
      console.error(
        "Erreur lecture notification :",
        error,
      );
    }
  };

  const buildTargetUrl = (
    basePath: string,
    referenceType?: string | null,
    referenceId?: number | null,
  ): string => {
    const params =
      new URLSearchParams();

    if (referenceType) {
      params.set(
        "target",
        referenceType,
      );
    }

    if (
      referenceId !== null &&
      referenceId !== undefined
    ) {
      params.set(
        "ref",
        String(referenceId),
      );
    }

    const queryString =
      params.toString();

    if (!queryString) {
      return basePath;
    }

    return `${basePath}?${queryString}`;
  };

  const getNotificationTarget = (
    notification: Notification,
  ): string | null => {
    if (!notification.trip_id) {
      return null;
    }

    const tripId =
      notification.trip_id;

    const referenceType =
      notification.reference_type;

    const referenceId =
      notification.reference_id;

    switch (notification.type) {
      case "participant_joined":
        return buildTargetUrl(
          `/trip/${tripId}/invitations`,
          referenceType ||
            "participant",
          referenceId,
        );

      case "vote_created":
        return buildTargetUrl(
          `/trip/${tripId}/steps`,
          referenceType ||
            "step",
          referenceId,
        );

      case "expense_created":
      case "expense_updated":
        return buildTargetUrl(
          `/trip/${tripId}/budget`,
          referenceType ||
            "expense",
          referenceId,
        );

      case "reimbursement_pending":
      case "reimbursement_confirmed":
      case "reimbursement_rejected":
        return buildTargetUrl(
          `/trip/${tripId}/budget`,
          referenceType ||
            "reimbursement",
          referenceId,
        );

      case "trip_invitation":
        return buildTargetUrl(
          `/trip/${tripId}/invitations`,
          referenceType,
          referenceId,
        );

      case "trip_updated":
        return buildTargetUrl(
          `/trip/${tripId}`,
          referenceType || "trip",
          referenceId || tripId,
        );

      default:
        return buildTargetUrl(
          `/trip/${tripId}`,
          referenceType,
          referenceId,
        );
    }
  };

  const handleNotificationClick =
    async (
      notification: Notification,
    ) => {
      await markAsRead(
        notification,
      );

      const target =
        getNotificationTarget(
          notification,
        );

      setIsOpen(false);

      if (target) {
        navigate(target);
      }
    };

  const markAllAsRead =
    async (): Promise<void> => {
      if (
        !token ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
            {
              method: "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            },
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de marquer toutes les notifications comme lues.",
          );
        }

        setNotifications(
          (
            currentNotifications,
          ) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                is_read: true,
              }),
            ),
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Erreur lecture notifications :",
          error,
        );
      }
    };

  const formatNotificationDate = (
    createdAt: string,
  ): string => {
    const notificationDate =
      new Date(createdAt);

    if (
      Number.isNaN(
        notificationDate.getTime(),
      )
    ) {
      return "";
    }

    const now =
      new Date();

    const differenceMilliseconds =
      now.getTime() -
      notificationDate.getTime();

    const differenceMinutes =
      Math.floor(
        differenceMilliseconds /
          60000,
      );

    if (
      differenceMinutes < 1
    ) {
      return "À l’instant";
    }

    if (
      differenceMinutes < 60
    ) {
      return `Il y a ${differenceMinutes} min`;
    }

    const differenceHours =
      Math.floor(
        differenceMinutes / 60,
      );

    if (
      differenceHours < 24
    ) {
      return `Il y a ${differenceHours} h`;
    }

    const differenceDays =
      Math.floor(
        differenceHours / 24,
      );

    if (
      differenceDays === 1
    ) {
      return "Hier";
    }

    if (
      differenceDays < 7
    ) {
      return `Il y a ${differenceDays} jours`;
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
      },
    ).format(
      notificationDate,
    );
  };

  const visibleNotifications =
    notifications.slice(0, 5);

  return (
    <div
      ref={notificationRef}
      className="notification-center"
    >
      <button
        type="button"
        className={`notification-bell-button ${
          isOpen
            ? "is-active"
            : ""
        }`}
        onClick={togglePanel}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notification${
                unreadCount > 1
                  ? "s"
                  : ""
              } non lue${
                unreadCount > 1
                  ? "s"
                  : ""
              }`
            : "Notifications"
        }
        aria-expanded={isOpen}
      >
        <Bell
          size={25}
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

      <div
        className={`notification-panel ${
          isOpen
            ? "is-open"
            : ""
        }`}
      >
        <div className="notification-panel-header">
          <div>
            <h3>
              Notifications
            </h3>

            {unreadCount > 0 ? (
              <span>
                {unreadCount} non lue
                {unreadCount > 1
                  ? "s"
                  : ""}
              </span>
            ) : (
              <span>
                Tout est à jour
              </span>
            )}
          </div>
        </div>

        <div className="notification-panel-content">
          {isLoading ? (
            <div className="notification-empty">
              <span>🔔</span>
              <p>
                Chargement...
              </p>
            </div>
          ) : visibleNotifications.length ===
            0 ? (
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
                          aria-label="Notification non lue"
                        />
                      )}
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <div className="notification-item-meta">
                      {notification.context_label && (
                        <>
                          <span>
                            {
                              notification.context_label
                            }
                          </span>

                          <span
                            aria-hidden="true"
                          >
                            ·
                          </span>
                        </>
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

        {visibleNotifications.length >
          0 && (
          <div className="notification-panel-footer">
            <button
              type="button"
              className="notification-mark-all"
              disabled={
                unreadCount === 0
              }
              onClick={
                markAllAsRead
              }
            >
              <CheckCheck
                size={17}
              />
              Tout marquer comme lu
            </button>

            <button
              type="button"
              className="notification-see-all"
              onClick={() => {
                console.log(
                  "Page complète des notifications à venir.",
                );
              }}
            >
              Voir toutes les notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}