import { Link, useLocation } from "react-router";
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

import { useAuth } from "../contexts/AuthContext";
import type { TheTrip } from "../types/tripType";

import NavTabs from "./NavTabs";
import Modal from "./Modal";

import TripActions from "../pages/TripActions";
import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";

import "../pages/styles/TripInfos.css";

type TripInfosProps = {
  trip: TheTrip | null;
  onTripUpdated: (updatedTrip: TheTrip) => void;

  totalSteps?: number;
  validatedStepsCount?: number;
};

type TripMember = {
  id: number;
  firstname: string;
  lastname?: string;
  avatar_url?: string | null;
};

function TripInfos({
  trip,
  onTripUpdated,
  totalSteps = 0,
  validatedStepsCount = 0,
}: TripInfosProps) {
  const { auth } = useAuth();
  const location = useLocation();

  const [isInviteModalOpen, setIsInviteModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [members, setMembers] =
    useState<TripMember[]>([]);

  /* =========================================================
     CHARGEMENT DES MEMBRES
  ========================================================= */

  useEffect(() => {
    if (!trip?.id) {
      return;
    }

    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${trip.id}/members`,
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les membres",
          );
        }

        const data = await response.json();

        const tripMembers = Array.isArray(data)
          ? data
          : (data.members ?? []);

        setMembers(tripMembers);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchMembers();
  }, [trip?.id]);

  if (!trip) {
    return null;
  }

  const tripId = trip.id;

  const isRecapPage =
    location.pathname === `/trip/${tripId}` ||
    location.pathname === `/trip/${tripId}/`;

  const isOrganizer =
    Number(auth?.user?.id) ===
    Number(trip.user_id);

  const stepsProgress =
    totalSteps === 0
      ? 0
      : Math.round(
          (validatedStepsCount / totalSteps) * 100,
        );

  /* =========================================================
     IMAGE GOOGLE PLACES
  ========================================================= */

  const getPlaceImageUrl = (
    placeId?: string | null,
  ) => {
    if (!placeId) {
      return "/images/default-city.jpg";
    }

    return `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`;
  };

  const headerImage =
    getPlaceImageUrl(trip.place_id);

  /* =========================================================
     MINI MAP GOOGLE
  ========================================================= */

  const getStaticMapUrl = (
    city: string,
    country: string,
  ) => {
    const apiKey =
      import.meta.env
        .VITE_APP_GOOGLE_MAPS_API_KEY;

    const mapLocation =
      `${city}, ${country}`;

    const params =
      new URLSearchParams({
        center: mapLocation,
        zoom: "11",
        size: "600x300",
        scale: "2",
        maptype: "roadmap",
        markers: `color:green|${mapLocation}`,
        key: apiKey,
      });

    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  };

  /* =========================================================
     FORMATAGE DATE
  ========================================================= */

  const formatDate = (
    dateString: string,
  ) => {
    const date =
      new Date(dateString);

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
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(date);
  };

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="trip-stage">
        <div className="trip-stage-glow trip-stage-glow-left" />
        <div className="trip-stage-glow trip-stage-glow-right" />
        <div className="trip-stage-grid" />

        <div className="trip-stage-center">
          <div
            className="trip-hero-card"
            style={{
              backgroundImage:
                `url(${headerImage})`,
            }}
          >
            <div className="trip-hero-overlay">
              <TripCard
                title={trip.title}
                city={trip.city}
                country={trip.country}
                startAt={trip.start_at}
                endAt={trip.end_at}
                participants={
                  members.length ||
                  trip.participants
                }
                role={
                  isOrganizer
                    ? "organizer"
                    : "participant"
                }
                localCurrency={null}
                baseCurrency={
                  trip.base_currency
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="trip-infos-navigation">
        <NavTabs />
      </div>

      {/* =====================================================
          CARTES DU RÉCAPITULATIF
      ====================================================== */}

      {isRecapPage && (
        <section className="trip-overview">
          {/* =================================================
              COLONNE GAUCHE : À PROPOS
          ================================================== */}

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
                  <Pencil size={17} />
                  Modifier
                </button>
              )}
            </div>

            {trip.description && (
              <p className="trip-overview-description">
                {trip.description}
              </p>
            )}

            <div className="trip-about-content">
              <div className="trip-overview-details">
                <div className="trip-overview-detail">
                  <MapPin size={19} />

                  <span className="trip-detail-label">
                    Destination
                  </span>

                  <strong>
                    {trip.city},{" "}
                    {trip.country}
                  </strong>
                </div>

                <div className="trip-overview-detail">
                  <CalendarDays size={19} />

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
                  <Coins size={19} />

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

              <div className="trip-about-map">
                <img
                  src={getStaticMapUrl(
                    trip.city,
                    trip.country,
                  )}
                  alt={`Carte de ${trip.city}`}
                />

                <span className="trip-about-map-label">
                  {trip.city}
                </span>
              </div>
            </div>
          </article>

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
                    <Users size={20} />
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
                {members.length}{" "}
                {members.length > 1
                  ? "participants"
                  : "participant"}
              </p>

              <div className="trip-members-content">
                <div className="trip-members-avatars">
                  {members.map(
                    (member) => {
                      const initials =
                        `${member.firstname?.[0] ?? ""}${
                          member.lastname?.[0] ?? ""
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
                    <Flag size={19} />
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
                  / {totalSteps}{" "}
                  étapes validées
                </span>

                <strong>
                  {stepsProgress}%
                </strong>
              </div>
            </article>
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
          tripId={tripId}
          title={trip.title}
          description={
            trip.description
          }
          city={trip.city}
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
          trip={trip}
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