import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
      };
      invitations: invitationType[];
    }
  | { error?: string; message?: string };

function Invitations() {
  const { id } = useParams<RouteParams>();
  const tripId = Number(id);

  const [trip, setTrip] = useState<TheTrip | null>(null);
  const [mytrip, setmyTrip] = useState<TheTrip | null>(null);
  const [attendees, setAttendees] = useState<Guest[]>([]);
  const [otherInvitations, setOtherInvitations] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteInvitation, setdeleteInvitation] = useState<Guest | null>(null);
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
        const data = await response.json();
        setmyTrip(data);
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

        const { trip, invitations } = result;
        setTrip(trip);

        const creator: Guest = {
          id: trip.user_id || 0,
          name: `${trip.owner_firstname ?? ""} ${trip.owner_lastname ?? ""}`.trim(),
          avatarUrl: null,
          addedAt: null,
          role: "organisateur",
        };

        const acceptedInvitations = invitations.filter(
          (invitation) => invitation.status === "accepted",
        );

        const acceptedGuests: Guest[] = acceptedInvitations.map((inv) => ({
          id: inv.user_id,
          name: `${inv.invited_firstname} ${inv.invited_lastname}`,
          avatarUrl: null,
          addedAt: inv.created_at,
          role: "membre",
        }));

        const attendees: Guest[] = [creator, ...acceptedGuests];

        const otherInvitationsGuests: Guest[] = invitations
          .filter((invitation) => invitation.status !== "accepted")
          .map((inv) => ({
            id: inv.user_id,
            name: `${inv.invited_firstname} ${inv.invited_lastname}`,
            avatarUrl: null,
            addedAt: inv.created_at,
            inviteState: inv.status === "refused" ? "refuse" : "en-attente",
            lastReminderAt: null,
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
        setdeleteInvitation(null);
      });
  };

  return (
    <>
      {!loading && trip && <TripInfos trip={mytrip} />}
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
                delete={setdeleteInvitation}
              />
              <Guests
                title="Invités"
                invited={otherInvitations}
                type="others"
              />
            </>
          )}
        </section>

        {deleteInvitation && (
          <div className="modal-backdrop">
            <div className="modal">
              <h4>Retirer ce membre ?</h4>
              <p>
                Voulez-vous vraiment retirer{" "}
                <strong>{deleteInvitation.name}</strong> de ce voyage ?
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-role"
                  onClick={() => setdeleteInvitation(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeParticipant(deleteInvitation.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Confirmer le retrait"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Invitations;
