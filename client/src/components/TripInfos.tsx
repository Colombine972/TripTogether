import {
  ArrowRight,
  CalendarDays,
  Coins,
  Flag,
  MapPin,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { useAuth } from "../contexts/AuthContext";

import type {
  Step,
  TheTrip,
} from "../types/tripType";

import TripActions from "../pages/TripActions";
import TripInvitation from "../pages/TripInvitation";

import Modal from "./Modal";
import NavTabs from "./NavTabs";
import NextStepCard from "./NextStepCard";
import RecentActivitiesCard from "./RecentActivitiesCard";

import "../pages/styles/TripInfos.css";

/* =========================================================
   TYPES
========================================================= */

type TripInfosProps = {
  trip: TheTrip | null;

  onTripUpdated: (
    updatedTrip: TheTrip,
  ) => void;

  totalSteps?: number;
  validatedStepsCount?: number;

  steps?: Step[];
};

type TripMember = {
  id: number;
  firstname: string;
  lastname?: string;
  avatar_url?: string | null;
};

/* =========================================================
   COMPOSANT
========================================================= */

function TripInfos({
  trip,
  onTripUpdated,
  totalSteps = 0,
  validatedStepsCount = 0,
  steps = [],
}: TripInfosProps) {
  const { auth } =
    useAuth();

  const location =
    useLocation();

  /* =======================================================
     MODALES
  ======================================================= */

  const [
    isInviteModalOpen,
    setIsInviteModalOpen,
  ] = useState(false);

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  /* =======================================================
     MEMBRES
  ======================================================= */

  const [
    members,
    setMembers,
  ] =
    useState<TripMember[]>(
      [],
    );

  /* =======================================================
     CHARGEMENT DES MEMBRES
  ======================================================= */

  useEffect(() => {
    if (!trip?.id) {
      return;
    }

    const fetchMembers =
      async () => {
        try {
          const response =
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/trips/${trip.id}/members`,
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Impossible de récupérer les membres",
            );
          }

          const data =
            await response.json();

          const tripMembers =
            Array.isArray(
              data,
            )
              ? data
              : (data.members ??
                []);

          setMembers(
            tripMembers,
          );
        } catch (error) {
          console.error(
            "Erreur récupération membres :",
            error,
          );
        }
      };

    void fetchMembers();
  }, [
    trip?.id,
  ]);

  /* =======================================================
     VOYAGE ABSENT
  ======================================================= */

  if (!trip) {
    return null;
  }

  /* =======================================================
     DONNÉES DU VOYAGE
  ======================================================= */

  const tripId =
    trip.id;

  const isRecapPage =
    location.pathname ===
      `/trip/${tripId}` ||
    location.pathname ===
      `/trip/${tripId}/`;

  const isOrganizer =
    Number(
      auth?.user?.id,
    ) ===
    Number(
      trip.user_id,
    );

  const participantCount =
    members.length ||
    trip.participants ||
    0;

  /* =======================================================
     PROGRESSION
  ======================================================= */

  const stepsProgress =
    totalSteps === 0
      ? 0
      : Math.round(
          (validatedStepsCount /
            totalSteps) *
            100,
        );

  /* =======================================================
     PHOTOS GOOGLE PLACES
  ======================================================= */

  const getPlaceImageUrl =
    (
      placeId?: string | null,
      photoIndex = 0,
    ) => {
      if (!placeId) {
        return "/images/default-city.jpg";
      }

      return `${
        import.meta.env
          .VITE_API_URL
      }/api/places/photo/${placeId}?photoIndex=${photoIndex}`;
    };

  const headerPhotos = [
    getPlaceImageUrl(
      trip.place_id,
      0,
    ),
    getPlaceImageUrl(
      trip.place_id,
      1,
    ),
    getPlaceImageUrl(
      trip.place_id,
      2,
    ),
  ];

  /* =======================================================
     MINI MAP GOOGLE
     UNIQUEMENT DANS "À PROPOS DU VOYAGE"
  ======================================================= */

  const getStaticMapUrl =
    (
      city: string,
      country: string,
    ) => {
      const apiKey =
        import.meta.env
          .VITE_APP_GOOGLE_MAPS_API_KEY;

      const mapLocation =
        `${city}, ${country}`;

      const params =
        new URLSearchParams(
          {
            center:
              mapLocation,

            zoom:
              "11",

            size:
              "600x300",

            scale:
              "2",

            maptype:
              "roadmap",

            markers:
              `color:green|${mapLocation}`,

            key:
              apiKey,
          },
        );

      return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    };

  /* =======================================================
     FORMATAGE DATE
  ======================================================= */

  const formatDate =
    (
      dateString: string,
    ) => {
      const date =
        new Date(
          dateString,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return dateString;
      }

      return new Intl.DateTimeFormat(
        "fr-FR",
        {
          day:
            "numeric",

          month:
            "long",

          year:
            "numeric",
        },
      ).format(
        date,
      );
    };

  /* =======================================================
     FALLBACK IMAGE
  ======================================================= */

  const handleImageError = (
    event: React.SyntheticEvent<
      HTMLImageElement
    >,
  ) => {
    event.currentTarget.src =
      "/images/default-city.jpg";
  };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <>
      {/* =====================================================
          HEADER DU VOYAGE
      ====================================================== */}

      <section className="trip-stage">
        <div className="trip-stage-glow trip-stage-glow-left" />

        <div className="trip-stage-glow trip-stage-glow-right" />

        <div className="trip-stage-grid" />

        <div className="trip-stage-center">
          <article className="trip-header-modern">
            {/* ===============================================
                INFORMATIONS DU VOYAGE
            ================================================ */}

            <div className="trip-header-modern-info">
              <div className="trip-header-location">
                <MapPin
                  size={18}
                />

                <span>
                  {trip.city},{" "}
                  {trip.country}
                </span>
              </div>

              <h1>
                {trip.title}
              </h1>

              {trip.description && (
                <p className="trip-header-description">
                  {
                    trip.description
                  }
                </p>
              )}

              <div className="trip-header-meta">
                <div className="trip-header-meta-item">
                  <CalendarDays
                    size={18}
                  />

                  <span>
                    {formatDate(
                      trip.start_at,
                    )}

                    {" – "}

                    {formatDate(
                      trip.end_at,
                    )}
                  </span>
                </div>

                <div className="trip-header-meta-item">
                  <Users
                    size={18}
                  />

                  <span>
                    {
                      participantCount
                    }{" "}
                    {participantCount >
                    1
                      ? "participants"
                      : "participant"}
                  </span>
                </div>
              </div>

              {isOrganizer && (
                <button
                  type="button"
                  className="trip-header-edit"
                  onClick={() =>
                    setIsEditModalOpen(
                      true,
                    )
                  }
                >
                  <Pencil
                    size={16}
                  />

                  Modifier le voyage
                </button>
              )}
            </div>

            {/* ===============================================
                GALERIE DE 3 PHOTOS
            ================================================ */}

            <div className="trip-header-gallery">
              <div className="trip-header-photo trip-header-photo-main">
                <img
                  src={
                    headerPhotos[0]
                  }
                  alt={`${trip.city}, ${trip.country}`}
                  onError={
                    handleImageError
                  }
                />
              </div>

              <div className="trip-header-photo trip-header-photo-secondary">
                <img
                  src={
                    headerPhotos[1]
                  }
                  alt={`Vue de ${trip.city}`}
                  onError={
                    handleImageError
                  }
                />
              </div>

              <div className="trip-header-photo trip-header-photo-third">
                <img
                  src={
                    headerPhotos[2]
                  }
                  alt={`Découverte de ${trip.city}`}
                  onError={
                    handleImageError
                  }
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="trip-infos-navigation">
        <NavTabs />
      </div>

      {/* =====================================================
          RÉCAPITULATIF
      ====================================================== */}

      {isRecapPage && (
        <section className="trip-overview">
          {/* =================================================
              COLONNE GAUCHE
          ================================================== */}

          <div className="trip-overview-left">
            {/* ===============================================
                À PROPOS DU VOYAGE
            ================================================ */}

            <article className="trip-overview-card trip-about-overview">
              <div className="trip-overview-header">
                <div className="trip-overview-heading">
                  <span className="trip-overview-icon">
                    ✦
                  </span>

                  <h2>
                    À propos du voyage
                  </h2>
                </div>

                {isOrganizer && (
                  <button
                    type="button"
                    className="trip-overview-action"
                    onClick={() =>
                      setIsEditModalOpen(
                        true,
                      )
                    }
                  >
                    <Pencil
                      size={17}
                    />

                    Modifier
                  </button>
                )}
              </div>

              {trip.description && (
                <p className="trip-overview-description">
                  {
                    trip.description
                  }
                </p>
              )}

              <div className="trip-about-content">
                <div className="trip-overview-details">
                  <div className="trip-overview-detail">
                    <MapPin
                      size={19}
                    />

                    <span className="trip-detail-label">
                      Destination
                    </span>

                    <strong>
                      {trip.city},{" "}
                      {
                        trip.country
                      }
                    </strong>
                  </div>

                  <div className="trip-overview-detail">
                    <CalendarDays
                      size={19}
                    />

                    <span className="trip-detail-label">
                      Dates
                    </span>

                    <strong>
                      {formatDate(
                        trip.start_at,
                      )}

                      {" - "}

                      {formatDate(
                        trip.end_at,
                      )}
                    </strong>
                  </div>

                  <div className="trip-overview-detail">
                    <Coins
                      size={19}
                    />

                    <span className="trip-detail-label">
                      Devise du voyage
                    </span>

                    <strong>
                      {trip.local_currency ||
                        trip.base_currency ||
                        "EUR"}
                    </strong>
                  </div>
                </div>

                {/* =============================================
                    MAP
                ============================================== */}

                <div className="trip-about-map">
                  <img
                    src={getStaticMapUrl(
                      trip.city,
                      trip.country,
                    )}
                    alt={`Carte de ${trip.city}`}
                  />

                  <span className="trip-about-map-label">
                    {
                      trip.city
                    }
                  </span>
                </div>
              </div>
            </article>

            {/* ===============================================
                DERNIÈRES ACTIVITÉS
            ================================================ */}

            <RecentActivitiesCard
              tripId={
                tripId
              }
            />
          </div>

          {/* =================================================
              COLONNE DROITE
          ================================================== */}

          <div className="trip-overview-right">
            {/* ===============================================
                PARTICIPANTS
            ================================================ */}

            <article className="trip-overview-card trip-members-overview">
              <div className="trip-overview-header">
                <div className="trip-overview-heading">
                  <span className="trip-members-icon">
                    <Users
                      size={20}
                    />
                  </span>

                  <h2>
                    Participants
                  </h2>
                </div>

                <Link
                  to={`/trip/${tripId}/invitations`}
                  className="trip-members-see-all"
                >
                  Voir tous

                  <ArrowRight
                    size={16}
                  />
                </Link>
              </div>

              <p className="trip-members-count">
                {
                  members.length
                }{" "}
                {members.length >
                1
                  ? "participants"
                  : "participant"}
              </p>

              <div className="trip-members-content">
                <div className="trip-members-avatars">
                  {members.map(
                    (
                      member,
                    ) => {
                      const initials =
                        `${member.firstname?.[0] ?? ""}${
                          member.lastname?.[0] ??
                          ""
                        }`.toUpperCase();

                      return member.avatar_url ? (
                        <img
                          key={
                            member.id
                          }
                          src={
                            member.avatar_url
                          }
                          alt={`${member.firstname} ${
                            member.lastname ??
                            ""
                          }`}
                          className="trip-member-avatar"
                        />
                      ) : (
                        <div
                          key={
                            member.id
                          }
                          className="trip-member-avatar trip-member-avatar-fallback"
                          title={`${member.firstname} ${
                            member.lastname ??
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

                  {isOrganizer && (
                    <div className="trip-member-invite">
                      <button
                        type="button"
                        className="trip-member-add"
                        aria-label="Inviter un participant"
                        onClick={() =>
                          setIsInviteModalOpen(
                            true,
                          )
                        }
                      >
                        <Plus
                          size={24}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* ===============================================
                PROGRESSION DES ÉTAPES
            ================================================ */}

            <article className="trip-overview-card trip-progress-card">
              <div className="trip-progress-header">
                <div className="trip-progress-title">
                  <span className="trip-progress-icon">
                    <Flag
                      size={19}
                    />
                  </span>

                  <h2>
                    Progression des étapes
                  </h2>
                </div>

                <Link
                  to={`/trip/${tripId}/steps`}
                  className="trip-progress-link"
                >
                  Voir toutes

                  <ArrowRight
                    size={16}
                  />
                </Link>
              </div>

              <div className="trip-progress-bar">
                <div
                  className="trip-progress-bar-value"
                  style={{
                    width:
                      `${stepsProgress}%`,
                  }}
                />
              </div>

              <div className="trip-progress-footer">
                <span>
                  {
                    validatedStepsCount
                  }{" "}
                  /{" "}
                  {
                    totalSteps
                  }{" "}
                  étapes validées
                </span>

                <strong>
                  {
                    stepsProgress
                  }
                  %
                </strong>
              </div>
            </article>

            {/* ===============================================
                PROCHAINE ÉTAPE
            ================================================ */}

            <NextStepCard
              tripId={
                tripId
              }
              steps={
                steps
              }
            />
          </div>
        </section>
      )}

      {/* =====================================================
          MODALE INVITATION
      ====================================================== */}

      <Modal
        isOpen={
          isInviteModalOpen
        }
        onClose={() =>
          setIsInviteModalOpen(
            false,
          )
        }
      >
        <TripInvitation
          tripId={
            tripId
          }
          title={
            trip.title
          }
          description={
            trip.description
          }
          city={
            trip.city
          }
          country={
            trip.country
          }
          startAt={
            trip.start_at
          }
          endAt={
            trip.end_at
          }
          participants={
            trip.participants
          }
          onClose={() =>
            setIsInviteModalOpen(
              false,
            )
          }
        />
      </Modal>

      {/* =====================================================
          MODALE MODIFICATION
      ====================================================== */}

      <Modal
        isOpen={
          isEditModalOpen
        }
        onClose={() =>
          setIsEditModalOpen(
            false,
          )
        }
      >
        <TripActions
          trip={
            trip
          }
          onClose={() =>
            setIsEditModalOpen(
              false,
            )
          }
          onTripUpdated={
            onTripUpdated
          }
        />
      </Modal>
    </>
  );
}

export default TripInfos;