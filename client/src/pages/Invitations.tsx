import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import Guests from "../components/Guests";
import NavTabs from "../components/NavTabs";
import TripInfos from "../components/TripInfos";
import type { Guest, invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";
import "./styles/invitations.css";

type RouteParams = {
  id: string;
};

type InvitationsResponse =
  | {
      trip: TheTrip & {
        owner_firstname?: string;
        owner_lastname?: string;
        owner_avatar_url?: string | null;
      };
      invitations: invitationType[];
    }
  | { error?: string; message?: string };

function Invitations() {
  const { id } = useParams<RouteParams>();
  const tripId = Number(id);

  const [searchParams] = useSearchParams();

  const notificationTarget = searchParams.get("target");

  const notificationReferenceId = searchParams.get("ref");

  const [trip, setTrip] = useState<TheTrip | null>(null);
  const [attendees, setAttendees] = useState<Guest[]>([]);
  const [otherInvitations, setOtherInvitations] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invitationToDelete, setInvitationToDelete] = useState<Guest | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tripId) {
      navigate("/", {
        state: {
          toast: {
            type: "error",
            message: "Voyage invalide",
          },
        },
      });
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`)
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Veuillez vous connecter pour accéder à ce voyage.");
            return;
          }

          throw new Error("Erreur chargement voyage");
        }

        const data: TheTrip = await response.json();
        setTrip(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger le voyage");
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}/invitations`)
      .then(async (response) => {
        const result: InvitationsResponse = await response.json();

        if (response.status === 400) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: "Requête invalide",
              },
            },
          });
          return;
        }

        if (response.status === 403) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: "Accès non autorisé",
              },
            },
          });
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement invitations");
        }

        if (!("trip" in result)) {
          setError("Données invitations invalides.");
          return;
        }

        const { trip: invitationTrip, invitations } = result;

        const creator: Guest = {
          id: invitationTrip.user_id || 0,
          name:
            `${invitationTrip.owner_firstname ?? ""} ${
              invitationTrip.owner_lastname ?? ""
            }`.trim() || "Organisateur",
          avatarUrl: invitationTrip.owner_avatar_url ?? null,
          addedAt: null,
          role: "organisateur",
        };

        const acceptedInvitations = invitations.filter(
          (invitation): invitation is invitationType & { user_id: number } =>
            invitation.status === "accepted" && invitation.user_id !== null,
        );

        const acceptedGuests: Guest[] = acceptedInvitations.map((inv) => ({
          id: inv.user_id,
          name:
            `${inv.invited_firstname ?? ""} ${inv.invited_lastname ?? ""}`.trim() ||
            "Participant",
          avatarUrl: inv.invited_avatar_url ?? null,
          addedAt: inv.created_at,
          role: "membre",
        }));

        const attendees: Guest[] = [creator, ...acceptedGuests];

        const otherInvitationsGuests: Guest[] = invitations
          .filter((invitation) => invitation.status !== "accepted")
          .map((inv) => ({
            id: inv.id,
            name:
              `${inv.invited_firstname ?? ""} ${inv.invited_lastname ?? ""}`.trim() ||
              inv.email ||
              "Invité",
            avatarUrl: inv.invited_avatar_url ?? null,
            addedAt: inv.created_at,
            inviteState: inv.status === "refused" ? "refuse" : "en-attente",
            lastReminderAt: inv.lastReminderAt ?? null,
          }));

        setAttendees(attendees);
        setOtherInvitations(otherInvitationsGuests);
      })
      .catch((err) => {
        console.error("Erreur fetch invitations:", err);
        setError("Impossible de charger les invitations.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tripId, navigate]);

  /* =========================================================
   NAVIGATION DEPUIS UNE NOTIFICATION PARTICIPANT
   ========================================================= */

  useEffect(() => {
    if (notificationTarget !== "participant" || !notificationReferenceId) {
      return;
    }

    if (loading) {
      return;
    }

    const selector = `[data-notification-ref="participant-${notificationReferenceId}"]`;

    let attempts = 0;

    const maxAttempts = 20;

    let timeoutId: number | undefined;

    const scrollToParticipant = () => {
      const participantElement = document.querySelector<HTMLElement>(selector);

      if (participantElement) {
        participantElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        participantElement.classList.add("notification-target-highlight");

        window.setTimeout(() => {
          participantElement.classList.remove("notification-target-highlight");
        }, 2500);

        return;
      }

      attempts += 1;

      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(scrollToParticipant, 150);
      }
    };

    timeoutId = window.setTimeout(scrollToParticipant, 150);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [notificationTarget, notificationReferenceId, loading]);

  const removeParticipant = (userId: number) => {
    if (!tripId) return;

    setIsDeleting(true);

    fetch(
      `${import.meta.env.VITE_API_URL}/api/invitation/${tripId}/${userId}`,
      {
        method: "DELETE",
      },
    )
      .then(async (response) => {
        if (response.status === 400) {
          toast.error("Requête invalide");
          return;
        }

        if (response.status === 403) {
          toast.error("Accès non autorisé");
          return;
        }

        if (response.status === 404) {
          toast.error("Membre introuvable");
          return;
        }

        if (!response.ok) {
          toast.error("Erreur serveur.");
          return;
        }

        setAttendees((prev) =>
          prev.filter((participant) => participant.id !== userId),
        );

        toast.success("Membre retiré du voyage.");
      })
      .catch(() => {
        toast.error("Erreur serveur.");
      })
      .finally(() => {
        setIsDeleting(false);
        setInvitationToDelete(null);
      });
  };

  return (
    <>
      {!loading && trip && <TripInfos trip={trip} onTripUpdated={setTrip} />}
      <div className="page-membre">
        <NavTabs />
        <section id="member-list">
          {loading && <p className="loading-text">Chargement des membres</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              <Guests
                title="Participants"
                invited={attendees}
                type="attendees"
                delete={setInvitationToDelete}
              />
              <Guests
                title="Invités"
                invited={otherInvitations}
                type="others"
              />
            </>
          )}
        </section>

        {invitationToDelete && (
          <div className="participant-delete-backdrop">
            <dialog
              open
              className="participant-delete-dialog"
              aria-labelledby="delete-participant-title"
            >
              <div className="participant-delete-icon" aria-hidden="true">
                !
              </div>

              <h4 id="delete-participant-title">Retirer ce participant ?</h4>

              <p>
                Voulez-vous vraiment retirer{" "}
                <strong>{invitationToDelete.name}</strong> de ce voyage ?
              </p>

              <div className="participant-delete-actions">
                <button
                  type="button"
                  className="participant-delete-cancel"
                  onClick={() => setInvitationToDelete(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="participant-delete-confirm"
                  onClick={() => removeParticipant(invitationToDelete.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Retrait..." : "Confirmer le retrait"}
                </button>
              </div>
            </dialog>
          </div>
        )}
      </div>
    </>
  );
}

export default Invitations;
