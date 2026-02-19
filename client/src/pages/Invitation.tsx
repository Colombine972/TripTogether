import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import "./styles/invitation.css";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import type { invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";

function Invitation() {
  const { id, invitationId } = useParams<{
    id: string;
    invitationId: string;
  }>();
  const [invitation, setInvitation] = useState<invitationType | null>(null);
  const [mytrip, setmyTrip] = useState<TheTrip | null>(null);
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    if (!invitationId) {
      toast.error("Invitation invalide");
      navigate("/");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`)

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

    fetch(`${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`)
      .then(async (response) => {
        const invitation = await response.json();

        if (response.status === 400) {
          toast.error(invitation.message);
          navigate("/");
        }

        if (response.status === 403) {
          toast.error(invitation.message);
          navigate("/");
        }

        if (response.status === 404) {
          toast.error(invitation.message);
          navigate("/");
        }

        if (response.status === 409) {
          toast.error(invitation.message);
          navigate("/");
        }

        if (response.status === 410) {
          toast.error(invitation.message);
          navigate("/");
        }

        setInvitation(invitation);
      })
      .catch(() => {
        toast.error("Invitation introuvable ou accès non autorisé");
        navigate("/");
      });
  }, [navigate, invitationId, id]);

  async function invitationResponded(status: "accepted" | "refused") {
    if (!invitationId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (status === "accepted") {
        toast.success("Invitation acceptée");
        navigate(`/trip/${id ?? invitation?.trip_id}`);
      } else {
        toast.error("Invitation refusée");
        navigate("/");
      }
    } catch (err) {
      toast.error("Erreur lors du traitement de l'invitation");
    }
  }

  return (
    <>
      <TripInfos trip={mytrip} />
      <main className="invitation-main">
        <article id="invitation" className="invitation-card">
          <p className="invitation-text">{`${auth?.user.firstname ?? ""}, vous avez été invité au voyage de`}</p>
          <img
            src="/profile-pic-logo.png"
            alt={invitation?.creator_firstname}
            className="invitation-avatar"
          />
          <p className="invitation-inviter-name">
            {`${invitation?.creator_firstname ?? ""} ${
              invitation?.creator_lastname ?? ""
            }`}
          </p>
          <p>"{invitation?.message}"</p>

          <div className="invitation-actions">
            <button
              type="button"
              className="invitation-btn-primary"
              onClick={() => invitationResponded("accepted")}
            >
              Accepter
            </button>
            <button
              type="button"
              className="invitation-btn-outline"
              onClick={() => invitationResponded("refused")}
            >
              Refuser
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

export default Invitation;
