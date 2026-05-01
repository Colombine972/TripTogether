import CurrencyBadge from "../components/CurrencyBadge";
import "./styles/TripCard.css";

type TripCardProps = {
  title?: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  participants: number | undefined;
  role?: "organizer" | "participant";
  localCurrency?: string | null;
  baseCurrency?: string | null;
};

function TripCard({
  title,
  city,
  country,
  startAt,
  endAt,
  participants,
  localCurrency,
}: TripCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <article className="tripcard-overlay-card">
      <p className="tripcard-overlay-location">
        {city}, {country}
      </p>
      <h2 className="tripcard-overlay-title">{title}</h2>

      <div className="tripcard-overlay-meta">
        <span className="tripcard-pill">
          🗓️ {formatDate(startAt)} - {formatDate(endAt)}
        </span>
        <span className="tripcard-pill">👥 {participants} participant(s)</span>
        {localCurrency && (
          <span className="tripcard-pill">
            <CurrencyBadge currencyCode={localCurrency} />
          </span>
        )}
      </div>
    </article>
  );
}

export default TripCard;
