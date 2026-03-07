import { useState } from "react";
import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import type { TheTrip } from "../types/tripType";
import Modal from "./Modal";
import "../pages/styles/TripInfos.css";

type TripInfosProps = {
  trip: TheTrip | null;
};

function TripInfos({ trip }: TripInfosProps) {
  if (!trip) return null;

  const tripId = trip.id;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  return (
    <>
      <header
        className="trip-header"
        style={{
          backgroundImage: `url(${trip.image_url || "/images/martinique.webp"})`,
        }}
      />

      <section
        id="trip-infos"
        aria-labelledby={`trip-${trip.id}-title`}
      >
        <h2 id={`trip-${trip.id}-title`} className="visually-hidden">
          {trip.title ?? `${trip.city}, ${trip.country}`}
        </h2>
        <div className="trip-infos-inner">
          <div className="tripcard-wrapper">
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
    </>
  );
}

export default TripInfos;
