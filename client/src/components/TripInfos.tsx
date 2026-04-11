import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type TripInfosProps = {
  trip: TheTrip | null;
};

function TripInfos({ trip }: TripInfosProps) {
  const { auth } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (!trip) return null;

  const tripId = trip.id;
  const isOrganizer = auth?.user?.id === trip.user_id;

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const headerImage = trip.photo_reference || "/images/default-city.jpg";

  return (
    <>
      <header
        className="trip-header"
        style={{
          backgroundImage: `url(${headerImage})`,
        }}
      />

      <section className="trip-trip-infos">
        <article className="trip-tripinfocard">
          <TripCard
            title={trip.title}
            city={trip.city}
            country={trip.country}
            startAt={trip.start_at}
            endAt={trip.end_at}
            participants={trip.participants}
            role={isOrganizer ? "organizer" : "participant"}
            onInvite={isOrganizer ? openInviteModal : undefined}
          />
        </article>
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
    </>
  );
}

export default TripInfos;
