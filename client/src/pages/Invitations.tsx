import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "react-toastify";

import Guests from "../components/Guests";
import TripInfos from "../components/TripInfos";

import { useAuth } from "../contexts/AuthContext";

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
  | {
      error?: string;
      message?: string;
    };

function Invitations() {
  const { id } = useParams<RouteParams>();

  const tripId = Number(id);

  const navigate = useNavigate();

  const { auth } = useAuth();

  const token = auth?.token || localStorage.getItem("token");

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

  /* =========================================================
     CHARGEMENT DU VOYAGE ET DES INVITATIONS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadInvitations = async () => {
      if (!tripId || Number.isNaN(tripId)) {
        navigate("/", {
          replace: true,
          state: {
            toast: {
              type: "error",
              message: "Voyage invalide",
            },
          },
        });

        return;
      }

      if (!token) {
        return;
      }

      setLoading(true);

      setError(null);

      try {
        /* =====================================================
           VOYAGE
        ====================================================== */

        const tripResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },
          },
        );

        const tripData = await tripResponse.json().catch(() => null);

        if (cancelled) {
          return;
        }

        /* =====================================================
           SESSION NON VALIDE
        ====================================================== */

        if (tripResponse.status === 401) {
          localStorage.removeItem("token");

          toast.error("Session expirée. Veuillez vous reconnecter.");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* =====================================================
           ACCÈS NON AUTORISÉ
        ====================================================== */

        if (tripResponse.status === 403) {
          navigate("/", {
            replace: true,
            state: {
              toast: {
                type: "error",
                message: "Accès non autorisé à ce voyage",
              },
            },
          });

          return;
        }

        /* =====================================================
           VOYAGE INTROUVABLE
        ====================================================== */

        if (tripResponse.status === 404) {
          navigate("/", {
            replace: true,
            state: {
              toast: {
                type: "error",
                message: "Ce voyage n'existe pas ou n'est plus disponible.",
              },
            },
          });

          return;
        }

        if (!tripResponse.ok) {
          throw new Error("Erreur chargement voyage");
        }

        setTrip(tripData);

        /* =====================================================
           INVITATIONS
        ====================================================== */

        const invitationsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/invitations`,
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: InvitationsResponse = await invitationsResponse
          .json()
          .catch(() => ({
            error: "Réponse serveur invalide",
          }));

        if (cancelled) {
          return;
        }

        /* =====================================================
           SESSION NON VALIDE
        ====================================================== */

        if (invitationsResponse.status === 401) {
          localStorage.removeItem("token");

          toast.error("Session expirée. Veuillez vous reconnecter.");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* =====================================================
           ACCÈS NON AUTORISÉ
        ====================================================== */

        if (invitationsResponse.status === 403) {
          navigate("/", {
            replace: true,
            state: {
              toast: {
                type: "error",
                message: "Accès non autorisé à ce voyage",
              },
            },
          });

          return;
        }

        if (invitationsResponse.status === 404) {
          navigate("/", {
            replace: true,
            state: {
              toast: {
                type: "error",
                message: "Voyage ou invitations introuvables",
              },
            },
          });

          return;
        }

        if (!invitationsResponse.ok) {
          throw new Error("Erreur chargement invitations");
        }

        if (!("trip" in result)) {
          setError("Données invitations invalides.");

          return;
        }

        const { trip: invitationTrip, invitations } = result;

        /* =====================================================
           ORGANISATEUR
        ====================================================== */

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

        /* =====================================================
           PARTICIPANTS ACCEPTÉS
        ====================================================== */

        const acceptedInvitations = invitations.filter(
          (
            invitation,
          ): invitation is invitationType & {
            user_id: number;
          } => invitation.status === "accepted" && invitation.user_id !== null,
        );

        const acceptedGuests: Guest[] = acceptedInvitations.map(
          (invitation) => ({
            id: invitation.user_id,

            name:
              `${invitation.invited_firstname ?? ""} ${
                invitation.invited_lastname ?? ""
              }`.trim() || "Participant",

            avatarUrl: invitation.invited_avatar_url ?? null,

            addedAt: invitation.created_at,

            role: "membre",
          }),
        );

        const attendeesList: Guest[] = [creator, ...acceptedGuests];

        /* =====================================================
           INVITATIONS NON ACCEPTÉES
        ====================================================== */

        const otherInvitationsGuests: Guest[] = invitations
          .filter((invitation) => invitation.status !== "accepted")
          .map((invitation) => ({
            id: invitation.id,

            name:
              `${invitation.invited_firstname ?? ""} ${
                invitation.invited_lastname ?? ""
              }`.trim() ||
              invitation.email ||
              "Invité",

            avatarUrl: invitation.invited_avatar_url ?? null,

            addedAt: invitation.created_at,

            inviteState:
              invitation.status === "refused" ? "refuse" : "en-attente",

            lastReminderAt: invitation.lastReminderAt ?? null,
          }));

        setAttendees(attendeesList);

        setOtherInvitations(otherInvitationsGuests);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Erreur chargement invitations :", err);

        setError("Impossible de charger les invitations.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [tripId, token, navigate]);

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

  /* =========================================================
     SUPPRESSION D'UN PARTICIPANT
  ========================================================= */

  const removeParticipant = async (userId: number) => {
    if (!tripId || !token) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${tripId}/${userId}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("token");

        toast.error("Session expirée. Veuillez vous reconnecter.");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (response.status === 403) {
        toast.error(data?.message || data?.error || "Accès non autorisé");

        return;
      }

      if (response.status === 404) {
        toast.error(data?.message || data?.error || "Membre introuvable");

        return;
      }

      if (!response.ok) {
        toast.error(data?.message || data?.error || "Erreur serveur.");

        return;
      }

      setAttendees((previous) =>
        previous.filter((participant) => participant.id !== userId),
      );

      toast.success("Membre retiré du voyage.");
    } catch (error) {
      console.error("Erreur suppression participant :", error);

      toast.error("Erreur serveur.");
    } finally {
      setIsDeleting(false);

      setInvitationToDelete(null);
    }
  };

  /* =========================================================
     DROITS ORGANISATEUR
  ========================================================= */

  const isOrganizer =
    Boolean(trip) &&
    Boolean(auth?.user?.id) &&
    Number(auth?.user?.id) === Number(trip?.user_id);

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      {!loading && trip && <TripInfos trip={trip} onTripUpdated={setTrip} />}

      <div className="page-membre">
        <section id="member-list">
          {loading && <p className="loading-text">Chargement des membres</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              <Guests
                title="Participants"
                invited={attendees}
                type="attendees"
                delete={isOrganizer ? setInvitationToDelete : undefined}
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
