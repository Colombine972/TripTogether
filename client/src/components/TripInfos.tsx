import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";
import { useState } from "react";

type TripInfosProps = {
  trip: TheTrip | null;
};

function TripInfos({ trip }: TripInfosProps) {
  if (!trip) return null;
  const tripId = trip.id;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
  };
  return (
    <>
      <header
        className="trip-header"
        style={{
          backgroundImage: `url("/images/martinique.webp")`,
        }}
      />
      {/* <header
        className="trip-header"
        style={{
          backgroundImage: `url(${trip.image_url || "/images/default-city.jpg"})`,
        }}
      /> */}
      <section className="trip-trip-infos">
        <article className="trip-tripinfocard">
          {trip && (
            <TripCard
              title={trip.title}
              city={trip.city}
              country={trip.country}
              startAt={trip.start_at}
              endAt={trip.end_at}
              participants={trip.participants}
              role={trip.role}
              onInvite={openInviteModal}
            />
          )}
        </article>
      </section>
      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal}>
        {trip && (
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
        )}
      </Modal>
    </>
  );
}
export default TripInfos;
