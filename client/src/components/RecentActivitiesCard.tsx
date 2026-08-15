import {
  Activity as ActivityIcon,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Pencil,
  ReceiptText,
  UserPlus,
  Vote,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../contexts/AuthContext";

import "../pages/styles/RecentActivitiesCard.css";

/* =========================================================
   TYPES
========================================================= */

type ActivityType =
  | "expense_created"
  | "expense_updated"
  | "participant_joined"
  | "step_created"
  | "vote_created"
  | "step_validated"
  | "step_rejected"
  | "trip_updated"
  | "reimbursement_pending"
  | "reimbursement_confirmed"
  | "reimbursement_rejected";

type Activity = {
  id: number;

  trip_id: number;

  user_id: number | null;

  firstname: string | null;
  lastname: string | null;

  type: ActivityType;

  title: string;
  message: string;

  reference_type: string | null;
  reference_id: number | null;

  created_at: string;
};

type ActivitiesResponse = {
  activities: Activity[];
};

type RecentActivitiesCardProps = {
  tripId: number;
};

/* =========================================================
   FORMATAGE DATE
========================================================= */

function formatActivityDate(createdAt: string): string {
  const activityDate = new Date(createdAt);

  if (Number.isNaN(activityDate.getTime())) {
    return "";
  }

  const now = new Date();

  const differenceMilliseconds = now.getTime() - activityDate.getTime();

  const differenceMinutes = Math.floor(differenceMilliseconds / 60000);

  if (differenceMinutes < 1) {
    return "À l’instant";
  }

  if (differenceMinutes < 60) {
    return `Il y a ${differenceMinutes} min`;
  }

  const differenceHours = Math.floor(differenceMinutes / 60);

  if (differenceHours < 24) {
    return `Il y a ${differenceHours} h`;
  }

  const differenceDays = Math.floor(differenceHours / 24);

  if (differenceDays === 1) {
    return "Hier";
  }

  if (differenceDays < 7) {
    return `Il y a ${differenceDays} jours`;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",

    month: "short",
  }).format(activityDate);
}

/* =========================================================
   COMPOSANT
========================================================= */

function RecentActivitiesCard({ tripId }: RecentActivitiesCardProps) {
  const navigate = useNavigate();

  const { auth } = useAuth();

  const token = auth?.token || localStorage.getItem("token") || "";

  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const fetchActivities = useCallback(async () => {
    if (!token || !tripId) {
      setActivities([]);

      setLoading(false);

      return;
    }

    setLoading(true);

    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/activities/${tripId}?limit=4`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response.json().catch(() => null)) as
        | ActivitiesResponse
        | {
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data && data.error
            ? data.error
            : "Impossible de charger les dernières activités.",
        );
      }

      const receivedActivities =
        data && "activities" in data && Array.isArray(data.activities)
          ? data.activities
          : [];

      setActivities(receivedActivities);
    } catch (error) {
      console.error("Erreur chargement activités :", error);

      setActivities([]);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les dernières activités.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, tripId]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  /* =======================================================
     ICÔNES
  ======================================================= */

  const renderActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "expense_created":
        return <ReceiptText size={18} />;

      case "expense_updated":
        return <Pencil size={18} />;

      case "step_created":
        return <MapPin size={18} />;

      case "vote_created":
        return <Vote size={18} />;

      case "step_validated":
        return <CheckCircle2 size={18} />;

      case "step_rejected":
        return <XCircle size={18} />;

      case "participant_joined":
        return <UserPlus size={18} />;

      case "trip_updated":
        return <Pencil size={18} />;

      case "reimbursement_pending":
      case "reimbursement_confirmed":
      case "reimbursement_rejected":
        return <WalletCards size={18} />;

      default:
        return <CircleDollarSign size={18} />;
    }
  };

  /* =======================================================
     NAVIGATION SELON L'ACTIVITÉ
  ======================================================= */

  const buildTargetUrl = (activity: Activity): string => {
    const referenceId = activity.reference_id;

    switch (activity.reference_type) {
      case "expense":
        return referenceId
          ? `/trip/${tripId}/budget?target=expense&ref=${referenceId}`
          : `/trip/${tripId}/budget`;

      case "step":
        return referenceId
          ? `/trip/${tripId}/steps?target=step&ref=${referenceId}`
          : `/trip/${tripId}/steps`;

      case "participant":
        return `/trip/${tripId}/invitations`;

      case "reimbursement":
        return referenceId
          ? `/trip/${tripId}/budget?target=reimbursement&ref=${referenceId}`
          : `/trip/${tripId}/budget`;

      case "trip":
        return `/trip/${tripId}`;

      default:
        return `/trip/${tripId}`;
    }
  };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <article className="recent-activities-card">
      <div className="recent-activities-header">
        <div className="recent-activities-heading">
          <span className="recent-activities-heading-icon">
            <ActivityIcon size={18} />
          </span>

          <h2>Dernières activités</h2>
        </div>
      </div>

      {loading ? (
        <div className="recent-activities-state">
          Chargement des activités...
        </div>
      ) : error ? (
        <div className="recent-activities-state recent-activities-state-error">
          {error}
        </div>
      ) : activities.length === 0 ? (
        <div className="recent-activities-empty">
          <span className="recent-activities-empty-icon">
            <MapPin size={22} />
          </span>

          <div>
            <strong>Aucune activité pour le moment</strong>

            <p>Les actions réalisées pendant le voyage apparaîtront ici.</p>
          </div>
        </div>
      ) : (
        <div className="recent-activities-list">
          {activities.map((activity, index) => {
            const author =
              [activity.firstname, activity.lastname]
                .filter(Boolean)
                .join(" ") || "Un participant";

            const isLast = index === activities.length - 1;

            const isSystemActivity =
              activity.type === "step_validated" ||
              activity.type === "step_rejected";

            return (
              <button
                key={activity.id}
                type="button"
                className="recent-activity-item"
                onClick={() => navigate(buildTargetUrl(activity))}
              >
                <div className="recent-activity-timeline">
                  <span
                    className={`recent-activity-icon recent-activity-icon-${activity.type}`}
                  >
                    {renderActivityIcon(activity.type)}
                  </span>

                  {!isLast && <span className="recent-activity-line" />}
                </div>

                <div className="recent-activity-content">
                  <div className="recent-activity-main">
                    <p>
                      {isSystemActivity ? (
                        <strong>{activity.message}</strong>
                      ) : (
                        <>
                          <strong>{author}</strong> {activity.message}
                        </>
                      )}
                    </p>

                    <time dateTime={activity.created_at}>
                      {formatActivityDate(activity.created_at)}
                    </time>
                  </div>

                  <span className="recent-activity-category">
                    {activity.title}
                  </span>
                </div>

                <ArrowRight size={16} className="recent-activity-arrow" />
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default RecentActivitiesCard;
