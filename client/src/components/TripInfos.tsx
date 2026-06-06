import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";

type TripInfosProps = {
  trip: TheTrip | null;
};

function TripInfos({ trip }: TripInfosProps) {
  const { auth } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!trip) return null;

  const tripId = trip.id;
  const isOrganizer = Number(auth?.user?.id) === Number(trip.user_id);

  const getPlaceImageUrl = (placeId?: string | null) => {
    if (!placeId) return "/images/default-city.jpg";

    return `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`;
  };

  const headerImage = getPlaceImageUrl(trip.place_id);

  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  return (
    <>
      <section className="trip-stage">
        <div className="trip-stage-glow trip-stage-glow-left" />
        <div className="trip-stage-glow trip-stage-glow-right" />
        <div className="trip-stage-grid" />
        <div className="trip-stage-line" />

        <div className="trip-stage-center">
          <div
            className="trip-hero-card"
            style={{ backgroundImage: `url(${headerImage})` }}
          >
            {isOrganizer && (
              <div className="trip-hero-actions">
                <button
                  type="button"
                  className="trip-hero-btn trip-hero-btn-primary"
                  onClick={openInviteModal}
                >
                  Inviter
                </button>

                <button
                  type="button"
                  className="trip-hero-btn trip-hero-btn-secondary"
                  onClick={openEditModal}
                >
                  Modifier
                </button>
              </div>
            )}

            <div className="trip-hero-overlay">
              <TripCard
                title={trip.title}
                city={trip.city}
                country={trip.country}
                startAt={trip.start_at}
                endAt={trip.end_at}
                participants={trip.participants}
                role={isOrganizer ? "organizer" : "participant"}
                localCurrency={trip.local_currency}
                baseCurrency={trip.base_currency}
              />
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal}>
        <TripInvitation
          tripId={tripId}
          title={trip.title}
          city={trip.city}
          country={trip.country}
          startAt={trip.start_at}
          endAt={trip.end_at}
          participants={trip.participants}
          onClose={closeInviteModal}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <div style={{ padding: "1rem" }}>
          <h2>Modifier le voyage</h2>
          <p>Le formulaire de modification viendra ici.</p>
        </div>
      </Modal>
    </>
  );
}

export default TripInfos;
