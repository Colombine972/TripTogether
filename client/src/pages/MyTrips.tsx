import {
  CalendarDays,
  Mail,
  MapPin,
  MoreHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";

import "./styles/MyTrips.css";

/* =========================================================
   TYPES VOYAGES
========================================================= */

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

/* =========================================================
   TYPES INVITATIONS
========================================================= */

interface PendingInvitation {
  id: number;
  trip_id: number;

  trip_title: string;

  trip_place_id?: string | null;

  trip_city?: string | null;
  trip_country?: string | null;

  trip_start_at: string;
  trip_end_at: string;

  creator_firstname: string;
  creator_lastname?: string | null;
  creator_avatar_url?: string | null;

  message?: string | null;

  status: "pending";
}

/* =========================================================
   ONGLETS
========================================================= */

type TripStatus =
  | "all"
  | "current"
  | "futur"
  | "past"
  | "invitations";

export default function MyTrips() {
  const { auth } = useAuth();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<TripStatus>("all");

  const [trips, setTrips] =
    useState<TheTrip[]>([]);

  const [
    pendingInvitations,
    setPendingInvitations,
  ] = useState<PendingInvitation[]>([]);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     TOKEN
  ========================================================= */

  const token =
    localStorage.getItem("token") ||
    auth?.token;

  /* =========================================================
     IMAGE GOOGLE PLACES
  ========================================================= */

  const getPlaceImageUrl = (
    placeId?: string | null,
  ) => {
    if (!placeId) {
      return "/images/default-city.jpg";
    }

    return `${
      import.meta.env.VITE_API_URL
    }/api/places/photo/${placeId}`;
  };

  /* =========================================================
     CHARGEMENT DES INVITATIONS EN ATTENTE

     Chargées indépendamment de l'onglet afin d'avoir
     constamment le compteur Invitations X.
  ========================================================= */

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchPendingInvitations =
      async () => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/invitation/pending`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            },
          );

          if (response.status === 401) {
            toast.error(
              "Votre session a expiré. Veuillez vous reconnecter.",
            );

            navigate("/login");

            return;
          }

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la récupération des invitations",
            );
          }

          const data:
            PendingInvitation[] =
            await response.json();

          setPendingInvitations(data);
        } catch (error) {
          console.error(
            "Erreur chargement invitations :",
            error,
          );
        }
      };

    fetchPendingInvitations();
  }, [token, navigate]);

  /* =========================================================
     CHARGEMENT DES VOYAGES
  ========================================================= */

  useEffect(() => {
    if (!token) {
      toast.error(
        "Vous devez être connecté pour voir vos voyages",
      );

      navigate("/login");

      return;
    }

    /*
     * Lorsque l'onglet Invitations est actif,
     * on ne demande pas les voyages au backend.
     */

    if (
      activeTab ===
      "invitations"
    ) {
      return;
    }

    fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/users/my-trips?status=${activeTab}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération",
          );
        }

        return response.json();
      })
      .then(
        (data: TheTrip[]) => {
          setTrips(data);
        },
      )
      .catch((error) => {
        console.error(
          "Error fetching trips:",
          error,
        );
      });
  }, [
    activeTab,
    token,
    navigate,
  ]);

  /* =========================================================
     FERMETURE DU MENU AU CLIC EXTÉRIEUR
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =========================================================
     SUPPRESSION D'UN VOYAGE
  ========================================================= */

  const handleDeleteTrip = async (
    event: React.MouseEvent,
    tripId: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setOpenMenuId(null);

    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce voyage ?",
      )
    ) {
      return;
    }

    try {
      if (!token) {
        toast.error(
          "Votre session a expiré.",
        );

        navigate("/login");

        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/trips/${tripId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        toast.error(
          "Erreur lors de la suppression",
        );

        return;
      }

      setTrips(
        (currentTrips) =>
          currentTrips.filter(
            (trip) =>
              trip.id !== tripId,
          ),
      );

      toast.success(
        "Voyage supprimé",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Erreur réseau",
      );
    }
  };

  /* =========================================================
     DATES
  ========================================================= */

  const formatDate = (
    dateString: string,
  ) => {
    return new Date(
      dateString,
    ).toLocaleDateString(
      "fr-FR",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  /* =========================================================
     STATUT DU VOYAGE
  ========================================================= */

  const getTripStatus = (
    trip: TheTrip,
  ) => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    const startDate =
      new Date(
        trip.start_at,
      );

    const endDate =
      new Date(
        trip.end_at,
      );

    startDate.setHours(
      0,
      0,
      0,
      0,
    );

    endDate.setHours(
      23,
      59,
      59,
      999,
    );

    if (
      today < startDate
    ) {
      return {
        label: "À venir",
        className:
          "upcoming",
      };
    }

    if (
      today > endDate
    ) {
      return {
        label: "Terminé",
        className: "past",
      };
    }

    return {
      label: "En cours",
      className:
        "current",
    };
  };

  /* =========================================================
     OUVRIR UNE INVITATION
  ========================================================= */

  const handleOpenInvitation = (
    invitation:
      PendingInvitation,
  ) => {
    navigate(
      `/trip/${invitation.trip_id}/invitation/${invitation.id}`,
    );

    window.scrollTo({
      top: 0,
    });
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mytripsheader">
        <img
          src="mesvoyages.png"
          alt=""
          className="mytripsheader-image"
          loading="eager"
          fetchPriority="high"
        />
      </section>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <div className="tripstate">
        <button
          type="button"
          className={
            activeTab ===
            "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "all",
            )
          }
        >
          Tous mes voyages
        </button>

        <button
          type="button"
          className={
            activeTab ===
            "current"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "current",
            )
          }
        >
          En cours
        </button>

        <button
          type="button"
          className={
            activeTab ===
            "futur"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "futur",
            )
          }
        >
          À venir
        </button>

        <button
          type="button"
          className={
            activeTab ===
            "past"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "past",
            )
          }
        >
          Passés
        </button>

        {/* ===============================================
            INVITATIONS
        ================================================ */}

        <button
          type="button"
          className={`tripstate-invitations ${
            activeTab ===
            "invitations"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "invitations",
            )
          }
        >
          <Mail
            size={16}
            aria-hidden="true"
          />

          <span>
            Invitations
          </span>

          {pendingInvitations.length >
            0 && (
            <span className="invitation-count">
              {
                pendingInvitations.length
              }
            </span>
          )}
        </button>
      </div>

      {/* =====================================================
          INVITATIONS EN ATTENTE
      ====================================================== */}

      {activeTab ===
      "invitations" ? (
        <section className="pending-invitations">
          {pendingInvitations.length >
          0 ? (
            <>
              <div className="pending-invitations-heading">
                <h1>
                  Invitations en
                  attente
                </h1>

                <p>
                  Retrouvez ici
                  les voyages
                  auxquels vous
                  avez été
                  invité.
                </p>
              </div>

              <div className="pending-invitations-list">
                {pendingInvitations.map(
                  (
                    invitation,
                  ) => {
                    const creatorName =
                      `${invitation.creator_firstname} ${
                        invitation.creator_lastname ??
                        ""
                      }`.trim();

                    return (
                      <article
                        className="pending-invitation-card"
                        key={
                          invitation.id
                        }
                      >
                        {/* ===============================
                            PHOTO DU VOYAGE
                        ================================ */}

                        <div className="pending-invitation-image-wrapper">
                          <img
                            src={getPlaceImageUrl(
                              invitation.trip_place_id,
                            )}
                            alt={
                              invitation.trip_title
                            }
                            className="pending-invitation-image"
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.onerror =
                                null;

                              event.currentTarget.src =
                                "/images/default-city.jpg";
                            }}
                          />

                          <span className="pending-invitation-status">
                            Invitation
                            en attente
                          </span>
                        </div>

                        {/* ===============================
                            CONTENU
                        ================================ */}

                        <div className="pending-invitation-content">
                          <div className="pending-invitation-inviter">
                            {invitation.creator_avatar_url ? (
                              <img
                                src={
                                  invitation.creator_avatar_url
                                }
                                alt={
                                  creatorName
                                }
                                className="pending-invitation-avatar"
                              />
                            ) : (
                              <div className="pending-invitation-avatar pending-invitation-avatar-placeholder">
                                <UserRound
                                  size={
                                    21
                                  }
                                />
                              </div>
                            )}

                            <p>
                              <strong>
                                {
                                  creatorName
                                }
                              </strong>{" "}
                              vous
                              invite
                              à
                              rejoindre
                              le
                              voyage
                            </p>
                          </div>

                          <h2>
                            {
                              invitation.trip_title
                            }
                          </h2>

                          {(invitation.trip_city ||
                            invitation.trip_country) && (
                            <p className="pending-invitation-location">
                              <MapPin
                                size={
                                  17
                                }
                              />

                              {[
                                invitation.trip_city,
                                invitation.trip_country,
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  ", ",
                                )}
                            </p>
                          )}

                          <p className="pending-invitation-dates">
                            <CalendarDays
                              size={
                                17
                              }
                            />

                            {formatDate(
                              invitation.trip_start_at,
                            )}{" "}
                            →{" "}
                            {formatDate(
                              invitation.trip_end_at,
                            )}
                          </p>

                          {invitation.message && (
                            <blockquote className="pending-invitation-message">
                              “
                              {
                                invitation.message
                              }
                              ”
                            </blockquote>
                          )}
                        </div>

                        {/* ===============================
                            ACTION
                        ================================ */}

                        <div className="pending-invitation-action">
                          <button
                            type="button"
                            className="pending-invitation-button"
                            onClick={() =>
                              handleOpenInvitation(
                                invitation,
                              )
                            }
                          >
                            Voir
                            l'invitation
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <div className="no-pending-invitations">
              <Mail
                size={38}
                aria-hidden="true"
              />

              <h2>
                Aucune
                invitation en
                attente
              </h2>

              <p>
                Vous n'avez
                aucune
                invitation à
                traiter pour
                le moment.
              </p>
            </div>
          )}
        </section>
      ) : (
        /* ===================================================
           VOYAGES
        =================================================== */

        <section className="tripcards">
          {trips.length >
          0 ? (
            trips.map(
              (trip) => {
                const status =
                  getTripStatus(
                    trip,
                  );

                const participants =
                  trip.participants ??
                  [];

                const visibleParticipants =
                  participants.slice(
                    0,
                    3,
                  );

                const remainingParticipants =
                  Math.max(
                    participants.length -
                      visibleParticipants.length,
                    0,
                  );

                return (
                  <article
                    className="tripcard"
                    key={
                      trip.id
                    }
                  >
                    {/* =============================
                        LIEN PRINCIPAL
                    ============================== */}

                    <Link
                      to={`/trip/${trip.id}`}
                      className="tripcard-main"
                    >
                      <img
                        src={getPlaceImageUrl(
                          trip.place_id,
                        )}
                        alt={
                          trip.title
                        }
                        className="trip-bg-img"
                        onError={(
                          event,
                        ) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            "/images/default-city.jpg";
                        }}
                      />

                      <div className="tripcard-overlay" />

                      {/* STATUT */}

                      <span
                        className={`trip-status ${status.className}`}
                      >
                        {
                          status.label
                        }
                      </span>

                      {/* INFORMATIONS */}

                      <div className="tripcard-content">
                        <h2>
                          {
                            trip.country
                          }
                        </h2>

                        <p className="tripcard-location">
                          <MapPin
                            size={
                              15
                            }
                          />

                          {
                            trip.city
                          }
                        </p>

                        <p className="tripcard-date">
                          <CalendarDays
                            size={
                              15
                            }
                          />

                          {formatDate(
                            trip.start_at,
                          )}{" "}
                          -{" "}
                          {formatDate(
                            trip.end_at,
                          )}
                        </p>

                        {/* PARTICIPANTS */}

                        {participants.length >
                          0 && (
                          <div className="tripcard-participants">
                            <div className="tripcard-avatars">
                              {visibleParticipants.map(
                                (
                                  participant,
                                ) => {
                                  const initials =
                                    `${participant.firstname?.[0] ?? ""}${
                                      participant.lastname?.[0] ??
                                      ""
                                    }`.toUpperCase();

                                  return participant.avatar_url ? (
                                    <img
                                      key={
                                        participant.id
                                      }
                                      src={
                                        participant.avatar_url
                                      }
                                      alt={`${participant.firstname} ${
                                        participant.lastname ??
                                        ""
                                      }`}
                                      className="tripcard-avatar"
                                    />
                                  ) : (
                                    <div
                                      key={
                                        participant.id
                                      }
                                      className="tripcard-avatar tripcard-avatar-initials"
                                      title={`${participant.firstname} ${
                                        participant.lastname ??
                                        ""
                                      }`}
                                    >
                                      {
                                        initials
                                      }
                                    </div>
                                  );
                                },
                              )}
                            </div>

                            {remainingParticipants >
                              0 && (
                              <span className="tripcard-more-participants">
                                +
                                {
                                  remainingParticipants
                                }
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* =============================
                        MENU ACTIONS
                    ============================== */}

                    <div
                      className="tripcard-actions"
                      ref={
                        openMenuId ===
                        trip.id
                          ? menuRef
                          : null
                      }
                    >
                      <button
                        type="button"
                        className="tripcard-menu-button"
                        aria-label={`Actions pour ${trip.title}`}
                        aria-expanded={
                          openMenuId ===
                          trip.id
                        }
                        onClick={(
                          event,
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();

                          setOpenMenuId(
                            (
                              currentId,
                            ) =>
                              currentId ===
                              trip.id
                                ? null
                                : trip.id,
                          );
                        }}
                      >
                        <MoreHorizontal
                          size={
                            22
                          }
                        />
                      </button>

                      {openMenuId ===
                        trip.id && (
                        <div className="tripcard-menu">
                          <button
                            type="button"
                            className="tripcard-delete-action"
                            onClick={(
                              event,
                            ) =>
                              handleDeleteTrip(
                                event,
                                trip.id,
                              )
                            }
                          >
                            <Trash2
                              size={
                                17
                              }
                            />

                            Supprimer
                            le
                            voyage
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              },
            )
          ) : (
            <p className="no-trips">
              Aucun voyage
              trouvé pour
              cette catégorie.
            </p>
          )}
        </section>
      )}
    </>
  );
}