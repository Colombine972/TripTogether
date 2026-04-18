import TripInvitation from "../pages/TripInvitation";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../pages/TripCard";

type TripInfosProps = {
  trip: TheTrip | null;
};

function TripInfos({ trip }: TripInfosProps) {
  const { auth } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!trip) return null;

  const tripId = trip.id;
  const isOrganizer = auth?.user?.id === trip.user_id;
  const headerImage = trip.photo_reference || "/images/default-city.jpg";

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <section className="trip-hero-wrapper">
        <div
          className="trip-hero-card"
          style={{
            backgroundImage: `url(${headerImage})`,
          }}
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
            />
          </div>
        </div>
      </section>

      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal}>
        <TripInvitation
          tripId={tripId}
          city={trip.city}
          title={trip.title}
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
