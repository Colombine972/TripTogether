import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";
import type { StepCardProps } from "../types/tripType";
import type { CreateVotePayload, Vote, VotesStats } from "../types/voteType";

import "../pages/styles/StepCard.css";

/* =========================================================
   HELPERS
========================================================= */

function getPlaceImageUrl(placeId?: string | null) {
  if (!placeId) {
    return "/images/default-city.jpg";
  }

  return `${import.meta.env.VITE_API_URL}/api/places/photo/${placeId}`;
}

function formatStepDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStepPeriod(startAt?: string | null, endAt?: string | null) {
  const formattedStart = formatStepDate(startAt);

  const formattedEnd = formatStepDate(endAt);

  if (formattedStart && formattedEnd) {
    if (formattedStart === formattedEnd) {
      return formattedStart;
    }

    return `${formattedStart} – ${formattedEnd}`;
  }

  return formattedStart || formattedEnd;
}

/* =========================================================
   COMPOSANT
========================================================= */

function StepCard({
  step,
  currentUserId,
  tripId,
  memberCount,
  onVoteSuccess,
}: StepCardProps) {
  /* =======================================================
     STATES
  ======================================================= */

  const [allVotes, setAllVotes] = useState<Vote[]>([]);

  const [loading, setLoading] = useState(true);

  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const [comment, setComment] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [showVotes, setShowVotes] = useState(false);

  /* =======================================================
     AUTH
  ======================================================= */

  const { auth, logout } = useAuth();

  const token = auth?.token || localStorage.getItem("token") || "";

  /* =======================================================
     DONNÉES DE LA CARTE
  ======================================================= */

  const stepImage = getPlaceImageUrl(step.place_id);

  const status = step.status ?? (step.is_initial ? "validated" : "pending");

  const stepPeriod = formatStepPeriod(step.start_at, step.end_at);

  /* =======================================================
     ICÔNES DE VOTE
  ======================================================= */

  const thumbsUpLogo = (
    <img
      src="/logos/green-thumb.png"
      className="step-vote-thumb"
      alt=""
      aria-hidden="true"
    />
  );

  const thumbsDownLogo = (
    <img
      src="/logos/brown-thumb.png"
      className="step-vote-thumb"
      alt=""
      aria-hidden="true"
    />
  );

  /* =======================================================
     CHARGEMENT DES VOTES
  ======================================================= */

  const loadVotes = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}/votes`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        logout();

        window.location.href = "/login";

        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des votes",
        );
      }

      const votesData = data as VotesStats;

      setAllVotes(votesData.allVotes);

      setError(null);
    } catch (error) {
      console.error("Erreur fetch votes :", error);

      setError(error instanceof Error ? error.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token, tripId, step.id, logout]);

  useEffect(() => {
    void loadVotes();
  }, [loadVotes]);

  /* =======================================================
     VOTE UTILISATEUR
  ======================================================= */

  const handleVote = async (voteValue: boolean) => {
    if (!token || alreadyVoted) {
      return;
    }

    setAlreadyVoted(true);

    setError(null);

    const createVoteData: CreateVotePayload = {
      vote: voteValue,

      comment: comment.trim() || undefined,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}/votes`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(createVoteData),
        },
      );

      if (response.status === 401) {
        logout();

        window.location.href = "/login";

        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erreur lors du vote");
      }

      setComment("");

      await loadVotes();

      if (onVoteSuccess) {
        await onVoteSuccess();
      }
    } catch (error) {
      console.error("Erreur lors du vote :", error);

      setError(error instanceof Error ? error.message : "Erreur lors du vote");
    } finally {
      setAlreadyVoted(false);
    }
  };

  /* =======================================================
     SUPPRESSION DE L'ÉTAPE
  ======================================================= */

  const handleDeleteStep = async () => {
    if (!window.confirm("Supprimer cette étape ?")) {
      return;
    }

    if (!token) {
      toast.error("Vous devez être connecté.");

      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || "Impossible de supprimer l'étape");
      }

      toast.success("Étape supprimée");

      if (onVoteSuccess) {
        await onVoteSuccess();
      }
    } catch (error) {
      console.error("Erreur suppression étape :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
      );
    }
  };

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const userVote = allVotes.find((vote) => vote.user_id === currentUserId);

  const hasVoted = Boolean(userVote);

  const yesVotes =
    step.voteStats?.yes ?? allVotes.filter((vote) => vote.vote).length;

  const noVotes =
    step.voteStats?.no ?? allVotes.filter((vote) => !vote.vote).length;

  const totalVotes = yesVotes + noVotes;

  const safeMemberCount = memberCount || 0;

  const voteProgress =
    safeMemberCount > 0
      ? Math.min(100, (totalVotes / safeMemberCount) * 100)
      : 0;

  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;

  /* =======================================================
     RENDU DU STATUT
  ======================================================= */

  const renderStatusBadge = () => {
    if (step.is_initial) {
      return (
        <span className="step-status-badge step-status-initial">
          <CheckCircle2 size={15} />
          Destination principale
        </span>
      );
    }

    if (status === "validated") {
      return (
        <span className="step-status-badge step-status-validated">
          <CheckCircle2 size={15} />
          Étape validée
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="step-status-badge step-status-rejected">
          <XCircle size={15} />
          Étape rejetée
        </span>
      );
    }

    return (
      <span className="step-status-badge step-status-pending">
        <Clock3 size={15} />
        Vote en cours
      </span>
    );
  };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <article
      className={`step-card step-card-${status} ${
        step.is_initial ? "step-card-initial" : ""
      }`}
    >
      {/* ===================================================
          PHOTO
      =================================================== */}

      <div className="step-card-image-wrapper">
        <img
          src={stepImage}
          alt={`Vue de ${step.city}`}
          className="step-card-image"
          onError={(event) => {
            event.currentTarget.src = "/images/default-city.jpg";
          }}
        />

        <div className="step-card-image-overlay" />

        <div className="step-card-status">{renderStatusBadge()}</div>

        {!step.is_initial && (
          <button
            type="button"
            className="step-delete-button"
            onClick={handleDeleteStep}
            aria-label={`Supprimer l'étape ${step.city}`}
            title="Supprimer cette étape"
          >
            <Trash2 size={18} />
          </button>
        )}

        <div className="step-card-image-title">
          <h3>{step.city}</h3>

          <span>{step.country}</span>
        </div>
      </div>

      {/* ===================================================
          INFORMATIONS
      =================================================== */}

      <div className="step-card-content">
        <div className="step-card-infos">
          {stepPeriod && (
            <div className="step-info-row">
              <span className="step-info-icon">
                <CalendarDays size={17} />
              </span>

              <span>{stepPeriod}</span>
            </div>
          )}

          <div className="step-info-row">
            <span className="step-info-icon">
              <UserRound size={17} />
            </span>

            <span>
              Proposée par <strong>{step.creator_name}</strong>
            </span>
          </div>
        </div>

        {/* =================================================
            DESTINATION INITIALE
        ================================================= */}

        {step.is_initial ? (
          <div className="step-initial-message">
            <CheckCircle2 size={19} />

            <div>
              <strong>Destination du voyage</strong>

              <span>Cette destination est automatiquement validée.</span>
            </div>
          </div>
        ) : (
          <>
            {/* ===============================================
                PROGRESSION DU VOTE
            =============================================== */}

            <div className="step-vote-summary">
              <div className="step-vote-summary-header">
                <div>
                  <span className="step-vote-summary-label">
                    Progression du vote
                  </span>

                  <strong>
                    {totalVotes}
                    {" / "}
                    {safeMemberCount} votes
                  </strong>
                </div>

                <span className="step-vote-percentage">
                  {Math.round(voteProgress)}%
                </span>
              </div>

              <div className="step-vote-progress-bar">
                <div
                  className="step-vote-progress-value"
                  style={{
                    width: `${voteProgress}%`,
                  }}
                />
              </div>

              <div className="step-vote-results">
                <span className="step-vote-result step-vote-result-yes">
                  {thumbsUpLogo}
                  <strong>{yesVotes}</strong>
                  Oui
                </span>

                <span className="step-vote-result step-vote-result-no">
                  {thumbsDownLogo}
                  <strong>{noVotes}</strong>
                  Non
                </span>
              </div>

              {totalVotes > 0 && (
                <div
                  className="step-vote-balance"
                  aria-label={`${Math.round(
                    yesPercentage,
                  )}% de votes favorables`}
                >
                  <div
                    className="step-vote-balance-yes"
                    style={{
                      width: `${yesPercentage}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ===============================================
                DÉTAIL DES VOTES
            =============================================== */}

            {allVotes.length > 0 ? (
              <div className="step-all-votes">
                <button
                  type="button"
                  className="step-toggle-votes"
                  onClick={() => setShowVotes((current) => !current)}
                  aria-expanded={showVotes}
                >
                  <span>
                    Voir les votes ({allVotes.length}
                    {" / "}
                    {safeMemberCount})
                  </span>

                  <ChevronDown
                    size={18}
                    className={showVotes ? "is-open" : ""}
                  />
                </button>

                {showVotes && (
                  <div className="step-votes-list">
                    {allVotes.map((vote) => (
                      <div
                        key={vote.id}
                        className={`step-vote-item ${
                          vote.vote ? "is-yes" : "is-no"
                        }`}
                      >
                        <div className="step-vote-user">
                          <div className="step-vote-user-line">
                            <strong>{vote.user_name}</strong>

                            <span className="step-vote-choice">
                              {vote.vote ? thumbsUpLogo : thumbsDownLogo}
                            </span>
                          </div>

                          {vote.comment && <p>« {vote.comment} »</p>}
                        </div>

                        <time className="step-vote-date">
                          {new Date(vote.created_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="step-no-votes">
                <Clock3 size={17} />
                En attente des premiers votes
              </div>
            )}

            {/* ===============================================
                ERREUR
            =============================================== */}

            {error && <p className="step-vote-error">{error}</p>}

            {/* ===============================================
                VOTE UTILISATEUR
            =============================================== */}

            {status === "pending" &&
              (loading ? (
                <div className="step-vote-loading">Chargement des votes...</div>
              ) : !hasVoted ? (
                <div className="step-vote-form">
                  <p className="step-vote-question">
                    Souhaitez-vous ajouter cette étape au voyage ?
                  </p>

                  <div className="step-vote-buttons">
                    <button
                      type="button"
                      className="step-vote-button step-vote-button-yes"
                      onClick={() => void handleVote(true)}
                      disabled={alreadyVoted}
                    >
                      {thumbsUpLogo}

                      {alreadyVoted ? "Envoi..." : "Oui"}
                    </button>

                    <button
                      type="button"
                      className="step-vote-button step-vote-button-no"
                      onClick={() => void handleVote(false)}
                      disabled={alreadyVoted}
                    >
                      {thumbsDownLogo}

                      {alreadyVoted ? "Envoi..." : "Non"}
                    </button>
                  </div>

                  <div className="step-comment-field">
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Ajouter un commentaire (optionnel)"
                      maxLength={500}
                      disabled={alreadyVoted}
                      rows={2}
                    />

                    <span>
                      {comment.length}
                      /500
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`step-my-vote ${
                    userVote?.vote ? "is-yes" : "is-no"
                  }`}
                >
                  <span>Votre vote</span>

                  <strong>{userVote?.vote ? "👍 Oui" : "👎 Non"}</strong>
                </div>
              ))}

            {/* ===============================================
                STATUT FINAL
            =============================================== */}

            {status === "validated" && (
              <div className="step-final-status step-final-status-validated">
                <CheckCircle2 size={20} />

                <div>
                  <strong>Étape validée</strong>

                  <span>Cette destination fait partie du voyage.</span>
                </div>
              </div>
            )}

            {status === "rejected" && (
              <div className="step-final-status step-final-status-rejected">
                <XCircle size={20} />

                <div>
                  <strong>Étape rejetée</strong>

                  <span>Cette proposition n'a pas obtenu la majorité.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export default StepCard;
