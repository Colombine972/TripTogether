import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import TripActions from "../pages/TripActions";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";

type TripInfosProps = {
  trip: TheTrip | null;
  onTripUpdated: (updatedTrip: TheTrip) => void;
};

function TripInfos({ trip, onTripUpdated }: TripInfosProps) {
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
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Inviter
                </button>

                <button
                  type="button"
                  className="trip-hero-btn trip-hero-btn-secondary"
                  onClick={() => setIsEditModalOpen(true)}
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

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      >
        <TripInvitation
          tripId={tripId}
          title={trip.title}
          description={trip.description}
          city={trip.city}
          country={trip.country}
          startAt={trip.start_at}
          endAt={trip.end_at}
          participants={trip.participants}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <TripActions
          trip={trip}
          onClose={() => setIsEditModalOpen(false)}
          onTripUpdated={onTripUpdated}
        />
      </Modal>
    </>
  );
}

export default TripInfos;