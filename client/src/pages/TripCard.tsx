import "./styles/TripCard.css";

type TripCardProps = {
  title?: string;
  city: string;
  country: string;
  startAt?: string | null;
  endAt?: string | null;
  participants?: number | null;
  role?: "organizer" | "participant" | string | null;
  onInvite?: () => void;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function TripCard({
  title,
  city,
  country,
  startAt,
  endAt,
  participants,
  onInvite,
}: TripCardProps) {
  return (
    <article className="tripcard-component">
      <div className="tripcard-top">
        <h2 className="tripcard-title">
          {title ?? `${city}, ${country}`}
        </h2>

        {onInvite && (
          <button
            type="button"
            className="tripcard-invitation-btn"
            onClick={onInvite}
          >
            Inviter
          </button>
        )}
      </div>

      <div className="tripcard-location">
        📍 {city}, {country}
      </div>

      <div className="tripcard-bottom">
        <div className="tripcard-date">
          📅 {formatDate(startAt)} - {formatDate(endAt)}
        </div>

        <div className="tripcard-participants">
          👥 {participants ?? 0} participant
          {participants && participants > 1 ? "s" : ""}
        </div>
      </div>
    </article>

  );
}

export default TripCard;
