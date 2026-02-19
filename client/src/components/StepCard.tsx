import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { StepCardProps } from "../types/tripType";
import type { CreateVotePayload, Vote, VotesStats } from "../types/voteType";
import "../pages/styles/StepCard.css";
import { toast } from "react-toastify";

function StepCard({
  step,
  currentUserId,
  tripId,
  memberCount,
  onVoteSuccess,
}: StepCardProps) {
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showVotes, setShowVotes] = useState(false);

  const { auth, logout } = useAuth();
  const token = auth?.token;

  const stepImage = step.image_url || "/images/default-city.jpg";
  const thumbsUpLogo = (
    <img src="/logos/green-thumb.png" className="green-thumb" alt="Oui" />
  );
  const thumbsDownLogo = (
    <img src="/logos/brown-thumb.png" className="brown-thumb" alt="Non" />
  );

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = () => {
    setLoading(true);
    setError(null);

    fetch(
      `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}/votes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(async (response) => {
        if (response.status === 401) {
          logout();
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la récupération des votes",
          );
        }
        const data: VotesStats = await response.json();

        setAllVotes(data.allVotes);
        setError(null);
      })
      .catch((err) => {
        console.error("Erreur fetch votes:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVote = (voteValue: boolean) => {
    setAlreadyVoted(true);
    setError(null);

    const createVoteData: CreateVotePayload = {
      vote: voteValue,
      comment: comment.trim() || undefined,
    };

    fetch(
      `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}/votes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createVoteData),
      },
    )
      .then(async (response) => {
        if (response.status === 401) {
          logout();
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors du vote");
        }

        loadVotes();

        if (onVoteSuccess) {
          onVoteSuccess();
        }
      })
      .catch((err) => {
        console.error("Erreur lors du vote:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du vote");
      })
      .finally(() => {
        setAlreadyVoted(false);
      });
  };

  const userVote = allVotes.find((v) => v.user_id === currentUserId);
  const hasVoted = Boolean(userVote);
  const yesVotes = step.voteStats?.yes ?? 0;
  const noVotes = step.voteStats?.no ?? 0;
  const totalVotes = yesVotes + noVotes;
  const yesPercentage = totalVotes === 0 ? 0 : (yesVotes / totalVotes) * 100;
  const handleDeleteStep = async () => {
    if (!window.confirm("Supprimer cette étape ?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps/${step.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        if (onVoteSuccess) onVoteSuccess(); // Rafraîchit la liste
        toast.success("Étape supprimée");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="step-card">
      <img
        src={stepImage}
        alt={`Vue de ${step.city}`}
        className="step-bg-img"
        referrerPolicy="no-referrer"
        style={{
          minHeight: "180px",
          display: "block",
          backgroundColor: "#f0f0f0",
          objectFit: "cover",
        }}
      />{" "}
      <article className="step-header">
        {!step.is_initial && (
          <button
            type="button"
            onClick={handleDeleteStep}
            className="delete-step-btn"
            title="Supprimer cette étape"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <title>Poubelle</title>
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 4.569a.75.75 0 0 0-1.44.32l.5 10a.75.75 0 0 0 1.498-.06l-.558-10.26Zm4.5 0a.75.75 0 0 0-1.5 0v10.26a.75.75 0 0 0 1.5 0v-10.26Zm3.536.26a.75.75 0 0 0-1.44-.32l-.558 10.26a.75.75 0 0 0 1.498.06l.5-10Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <h2>{step.city}</h2>
        <h3>{step.country}</h3>
        <h3 id="step-header-end">Proposée par {step.creator_name} </h3>
      </article>
      {step.is_initial ? (
        <div className="step-initial">
          <p className="step-initial-msg">Destination initiale</p>
        </div>
      ) : (
        <article className="step-body">
          <div className="vote-progress">
            <div className="vote-stats">
              <span className="stat-value yes">
                {thumbsUpLogo} {yesVotes}
              </span>
              <span className="stat-value no">
                {thumbsDownLogo} {noVotes}
              </span>
            </div>
            <div className="vote-bar">
              <div
                className="vote-bar-yes"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>
          {allVotes && allVotes.length > 0 ? (
            <div className="all-votes-section">
              <button
                type="button"
                onClick={() => setShowVotes(!showVotes)}
                className="toggle-votes-btn"
              >
                {showVotes ? "▲ Masquer" : "▼ Voir"} tous les votes (
                {allVotes.length} / {memberCount})
              </button>
              {showVotes && (
                <div className="votes-list">
                  {allVotes.map((vote) => (
                    <div
                      key={vote.id}
                      className={`vote-item ${vote.vote ? "vote-yes-item" : "vote-no-item"}`}
                    >
                      <div className="vote-content">
                        <p className="vote-user">
                          {vote.user_name}
                          <span className="vote-value">
                            {vote.vote ? thumbsUpLogo : thumbsDownLogo}
                          </span>
                        </p>
                        {vote.comment && (
                          <p className="vote-comment-text">"{vote.comment}"</p>
                        )}
                      </div>
                      <span className="vote-date">
                        {new Date(vote.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-votes-placeholder">
              <p className="toggle-votes-btn">En attente de vote</p>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          {loading ? (
            <p className="loading-text">Chargement</p>
          ) : !hasVoted ? (
            <div className="vote-section">
              <div className="vote-buttons">
                <button
                  type="button"
                  onClick={() => handleVote(true)}
                  disabled={alreadyVoted}
                  className="vote-btn vote-yes"
                >
                  {alreadyVoted ? (
                    "Envoi..."
                  ) : (
                    <span className="vote-yes-btn">{thumbsUpLogo} OUI</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleVote(false)}
                  disabled={alreadyVoted}
                  className="vote-btn vote-no"
                >
                  {alreadyVoted ? (
                    "Envoi..."
                  ) : (
                    <span className="vote-no-btn">{thumbsDownLogo} NON</span>
                  )}
                </button>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire (optionnel)"
                maxLength={500}
                disabled={alreadyVoted}
                className="vote-comment"
                rows={3}
              />
              <p className="comment-counter">{comment.length}/500 caractères</p>
            </div>
          ) : (
            <div className="voted-message">
              <p className="voted-text">
                {userVote?.vote ? (
                  <span className="voted-yes">{thumbsUpLogo} Voté OUI</span>
                ) : (
                  <span className="voted-no">{thumbsDownLogo} Voté NON</span>
                )}
              </p>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

export default StepCard;
