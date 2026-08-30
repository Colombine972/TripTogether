import { ArrowRight, CalendarDays, MapPin, Navigation } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import type { Step } from "../types/tripType";

import "../pages/styles/NextStepCard.css";

/* =========================================================
   TYPES
========================================================= */

interface NextStepCardProps {
  tripId: number;
  steps: Step[];
}

/* =========================================================
   HELPERS DATES
========================================================= */

function getStartOfDay(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function getEndOfDay(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  date.setHours(23, 59, 59, 999);

  return date;
}

function formatNextStepDate(startAt?: string | null, endAt?: string | null) {
  if (!startAt) {
    return "";
  }

  const start = new Date(startAt);

  const end = endAt ? new Date(endAt) : null;

  if (Number.isNaN(start.getTime())) {
    return "";
  }

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (
    !end ||
    Number.isNaN(end.getTime()) ||
    start.toDateString() === end.toDateString()
  ) {
    return dateFormatter.format(start);
  }

  const shortFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return `${shortFormatter.format(start)} – ${dateFormatter.format(end)}`;
}

/* =========================================================
   COMPOSANT
========================================================= */

function NextStepCard({ tripId, steps }: NextStepCardProps) {
  const navigate = useNavigate();

  /* =======================================================
     DATE DU JOUR
  ======================================================= */

  const today = useMemo(() => getStartOfDay(new Date()), []);

  /* =======================================================
     PROCHAINE ÉTAPE
  ======================================================= */

  const nextStepData = useMemo(() => {
    /*
     * On exclut :
     * - la destination principale
     * - les étapes non validées
     * - les étapes sans date
     */
    const validatedSteps = steps
      .filter(
        (step) =>
          step.status === "validated" &&
          !step.is_initial &&
          Boolean(step.start_at),
      )
      .map((step) => ({
        step,

        startDate: getStartOfDay(step.start_at as string),

        endDate: getEndOfDay(step.end_at || step.start_at || ""),
      }))
      .filter(
        ({ startDate, endDate }) =>
          !Number.isNaN(startDate.getTime()) &&
          !Number.isNaN(endDate.getTime()),
      );

    /* ===============================================
         ÉTAPE ACTUELLEMENT EN COURS
      =============================================== */

    const currentStep = validatedSteps
      .filter(
        ({ startDate, endDate }) => today >= startDate && today <= endDate,
      )
      .sort(
        (first, second) =>
          first.startDate.getTime() - second.startDate.getTime(),
      )[0];

    if (currentStep) {
      return {
        step: currentStep.step,

        isCurrent: true,
      };
    }

    /* ===============================================
         PROCHAINE ÉTAPE FUTURE
      =============================================== */

    const futureStep = validatedSteps
      .filter(({ startDate }) => startDate > today)
      .sort(
        (first, second) =>
          first.startDate.getTime() - second.startDate.getTime(),
      )[0];

    if (futureStep) {
      return {
        step: futureStep.step,

        isCurrent: false,
      };
    }

    return null;
  }, [steps, today]);

  /* =======================================================
     IMAGE
  ======================================================= */

  const getStepImage = (placeId?: string | null) => {
    if (!placeId) {
      return "/images/default-city.jpg";
    }

    return `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`;
  };

  /* =======================================================
     RENDU VIDE
  ======================================================= */

  if (!nextStepData) {
    return (
      <article className="next-step-card next-step-card-empty">
        <div className="next-step-header">
          <div className="next-step-title">
            <span className="next-step-title-icon">
              <Navigation size={19} />
            </span>

            <h3>Prochaine étape</h3>
          </div>

          <button
            type="button"
            className="next-step-see-all"
            onClick={() => navigate(`/trip/${tripId}/steps`)}
          >
            Voir les étapes
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="next-step-empty-content">
          <span className="next-step-empty-icon">
            <MapPin size={24} />
          </span>

          <div>
            <strong>Aucune prochaine étape programmée</strong>

            <p>Les prochaines étapes validées apparaîtront ici.</p>
          </div>
        </div>
      </article>
    );
  }

  const { step, isCurrent } = nextStepData;

  const formattedDate = formatNextStepDate(step.start_at, step.end_at);

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <article className="next-step-card">
      <div className="next-step-header">
        <div className="next-step-title">
          <span className="next-step-title-icon">
            <Navigation size={19} />
          </span>

          <h2>Prochaine étape</h2>
        </div>

        <button
          type="button"
          className="next-step-see-all"
          onClick={() => navigate(`/trip/${tripId}/steps`)}
        >
          Voir les étapes
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="next-step-content">
        <div className="next-step-info">
          {isCurrent && (
            <span className="next-step-current-badge">En cours</span>
          )}

          <div>
            {!isCurrent && <span className="next-step-eyebrow">À venir</span>}

            <h4>{step.city}</h4>

            <p className="next-step-country">{step.country}</p>
          </div>

          {formattedDate && (
            <div className="next-step-date">
              <CalendarDays size={17} />

              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        <div className="next-step-image-wrapper">
          <img
            src={getStepImage(step.place_id)}
            alt={`Vue de ${step.city}`}
            className="next-step-image"
            onError={(event) => {
              event.currentTarget.src = "/images/default-city.jpg";
            }}
          />

          <div className="next-step-image-overlay" />
        </div>
      </div>
    </article>
  );
}

export default NextStepCard;
