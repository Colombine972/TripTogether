import { CalendarDays, MapPin, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "./styles/MyTrips.css";

interface TripParticipant {
  id: number;
  firstname: string;
  lastname?: string;
  avatar_url?: string | null;
}

interface TheTrip {
  id: number;
  title: string;
  description: string;
  place_id?: string | null;
  start_at: string;
  city: string;
  country: string;
  end_at: string;

  participants?: TripParticipant[];
}

type TripStatus = "futur" | "current" | "past" | "all";

export default function MyTrips() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TripStatus>("all");
  const [trips, setTrips] = useState<TheTrip[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     IMAGE GOOGLE PLACES
  ========================================================= */

  const getPlaceImageUrl = (placeId?: string | null) => {
    if (!placeId) {
      return "/images/default-city.jpg";
    }

    return `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`;
  };

  /* =========================================================
     CHARGEMENT DES VOYAGES
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token") || auth?.token;

    if (!token) {
      toast.error("Vous devez être connecté pour voir vos voyages");
      navigate("/login");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/users/my-trips?status=${activeTab}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération");
        }

        return response.json();
      })
      .then((data: TheTrip[]) => {
        setTrips(data);
      })
      .catch((error) => {
        console.error("Error fetching trips:", error);
      });
  }, [activeTab, auth?.token, navigate]);

  /* =========================================================
     FERMETURE DU MENU AU CLIC EXTÉRIEUR
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  const handleDeleteTrip = async (event: React.MouseEvent, tripId: number) => {
    event.preventDefault();
    event.stopPropagation();

    setOpenMenuId(null);

    if (!window.confirm("Voulez-vous vraiment supprimer ce voyage ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token") || auth?.token;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        toast.error("Erreur lors de la suppression");
        return;
      }

      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip.id !== tripId),
      );

      toast.success("Voyage supprimé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    }
  };

  /* =========================================================
     DATES
  ========================================================= */

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     STATUT DU VOYAGE
  ========================================================= */

  const getTripStatus = (trip: TheTrip) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(trip.start_at);
    const endDate = new Date(trip.end_at);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (today < startDate) {
      return {
        label: "À venir",
        className: "upcoming",
      };
    }

    if (today > endDate) {
      return {
        label: "Terminé",
        className: "past",
      };
    }

    return {
      label: "En cours",
      className: "current",
    };
  };


  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <header className="mytripsheader" />

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <div className="tripstate">
        <button
          type="button"
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          Tous mes voyages
        </button>

        <button
          type="button"
          className={activeTab === "current" ? "active" : ""}
          onClick={() => setActiveTab("current")}
        >
          En cours
        </button>

        <button
          type="button"
          className={activeTab === "futur" ? "active" : ""}
          onClick={() => setActiveTab("futur")}
        >
          À venir
        </button>

        <button
          type="button"
          className={activeTab === "past" ? "active" : ""}
          onClick={() => setActiveTab("past")}
        >
          Passés
        </button>
      </div>

      {/* =====================================================
          VOYAGES
      ====================================================== */}

      <section className="tripcards">
        {trips.length > 0 ? (
          trips.map((trip) => {
            const status = getTripStatus(trip);

            const participants = trip.participants ?? [];

            const visibleParticipants = participants.slice(0, 3);

            const remainingParticipants = Math.max(
              participants.length - visibleParticipants.length,
              0,
            );

            return (
              <article className="tripcard" key={trip.id}>
                {/* =================================================
                    LIEN PRINCIPAL
                ================================================== */}

                <Link to={`/trip/${trip.id}`} className="tripcard-main">
                  <img
                    src={getPlaceImageUrl(trip.place_id)}
                    alt={trip.title}
                    className="trip-bg-img"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/default-city.jpg";
                    }}
                  />

                  <div className="tripcard-overlay" />

                  {/* STATUT */}

                  <span className={`trip-status ${status.className}`}>
                    {status.label}
                  </span>

                  {/* INFORMATIONS */}

                  <div className="tripcard-content">
                    <h2>{trip.country}</h2>

                    <p className="tripcard-location">
                      <MapPin size={15} />
                      {trip.city}
                    </p>

                    <p className="tripcard-date">
                      <CalendarDays size={15} />
                      {formatDate(trip.start_at)} - {formatDate(trip.end_at)}
                    </p>

                    {/* PARTICIPANTS */}

                    {participants.length > 0 && (
                      <div className="tripcard-participants">
                        <div className="tripcard-avatars">
                          {visibleParticipants.map((participant) => {
                            const initials =
                              `${participant.firstname?.[0] ?? ""}${
                                participant.lastname?.[0] ?? ""
                              }`.toUpperCase();

                            return participant.avatar_url ? (
                              <img
                                key={participant.id}
                                src={participant.avatar_url}
                                alt={`${participant.firstname} ${
                                  participant.lastname ?? ""
                                }`}
                                className="tripcard-avatar"
                              />
                            ) : (
                              <div
                                key={participant.id}
                                className="tripcard-avatar tripcard-avatar-initials"
                                title={`${participant.firstname} ${
                                  participant.lastname ?? ""
                                }`}
                              >
                                {initials}
                              </div>
                            );
                          })}
                        </div>

                        {remainingParticipants > 0 && (
                          <span className="tripcard-more-participants">
                            +{remainingParticipants}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>

                {/* =================================================
                    MENU ACTIONS
                ================================================== */}

                <div
                  className="tripcard-actions"
                  ref={openMenuId === trip.id ? menuRef : null}
                >
                  <button
                    type="button"
                    className="tripcard-menu-button"
                    aria-label={`Actions pour ${trip.title}`}
                    aria-expanded={openMenuId === trip.id}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      setOpenMenuId((currentId) =>
                        currentId === trip.id ? null : trip.id,
                      );
                    }}
                  >
                    <MoreHorizontal size={22} />
                  </button>

                  {openMenuId === trip.id && (
                    <div className="tripcard-menu">
                      <button
                        type="button"
                        className="tripcard-delete-action"
                        onClick={(event) => handleDeleteTrip(event, trip.id)}
                      >
                        <Trash2 size={17} />
                        Supprimer le voyage
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="no-trips">Aucun voyage trouvé pour cette catégorie.</p>
        )}
      </section>
    </>
  );
}
