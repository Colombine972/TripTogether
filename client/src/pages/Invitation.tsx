import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import TripInfos from "../components/TripInfos";

import { useAuth } from "../contexts/AuthContext";

import type { invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";

import "./styles/invitation.css";

function Invitation() {
  const { id, invitationId } = useParams<{
    id: string;
    invitationId: string;
  }>();

  const navigate = useNavigate();

  const { auth } = useAuth();

  const [invitation, setInvitation] =
    useState<invitationType | null>(null);

  const [myTrip, setMyTrip] =
    useState<TheTrip | null>(null);

  /* =========================================================
     CHARGEMENT DU VOYAGE ET DE L'INVITATION
  ========================================================= */

  useEffect(() => {
    if (!invitationId) {
      toast.error("Invitation invalide");

      navigate("/");

      return;
    }

    /* =====================================================
       VOYAGE
    ====================================================== */

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            toast.error(
              "Veuillez vous connecter pour accéder à ce voyage.",
            );

            return;
          }

          throw new Error("Erreur chargement voyage");
        }

        const data = await response.json();

        setMyTrip(data);
      })
      .catch((error) => {
        console.error(error);

        toast.error("Impossible de charger le voyage");
      });

    /* =====================================================
       INVITATION
    ====================================================== */

    fetch(
      `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
    )
      .then(async (response) => {
        const invitationData = await response.json();

        if (response.status === 400) {
          toast.error(invitationData.message);

          navigate("/");

          return;
        }

        if (response.status === 403) {
          toast.error(invitationData.message);

          navigate("/");

          return;
        }

        if (response.status === 404) {
          navigate("/", {
            state: {
              toast: {
                type: "error",

                message:
                  "Veuillez vous connecter pour accéder à l'invitation",
              },
            },
          });

          toast.error(invitationData.message);

          return;
        }

        if (response.status === 409) {
          toast.error(invitationData.message);

          navigate("/");

          return;
        }

        if (response.status === 410) {
          toast.error(invitationData.message);

          navigate("/");

          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement invitation");
        }

        setInvitation(invitationData);
      })
      .catch((error) => {
        console.error(error);

        toast.error("Invitation introuvable ou accès non autorisé");

        navigate("/");
      });
  }, [navigate, invitationId, id]);

  /* =========================================================
     RÉPONSE À L'INVITATION
  ========================================================= */

  const invitationResponded = async (
    status: "accepted" | "refused",
  ) => {
    if (!invitationId) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      if (status === "accepted") {
        toast.success("Invitation acceptée");

        navigate(
          `/trip/${id ?? invitation?.trip_id}`,
        );

        return;
      }

      toast.info("Invitation refusée");

      navigate("/");
    } catch (error) {
      console.error(
        "Erreur traitement invitation :",
        error,
      );

      toast.error(
        "Erreur lors du traitement de l'invitation",
      );
    }
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      {/* =====================================================
          APERÇU DU VOYAGE
          MODE CONSULTATION UNIQUEMENT
      ====================================================== */}

      <TripInfos
        trip={myTrip}
        onTripUpdated={setMyTrip}
        canEdit={false}
      />

      {/* =====================================================
          INVITATION
      ====================================================== */}

      <main className="invitation-main">
        <article
          id="invitation"
          className="invitation-card"
        >
          <p className="invitation-text">
            {`${auth?.user.firstname ?? ""}, vous avez été invité au voyage de`}
          </p>

          <img
            src="/profile-pic-logo.png"
            alt={invitation?.creator_firstname ?? "Organisateur"}
            className="invitation-avatar"
          />

          <p className="invitation-inviter-name">
            {`${invitation?.creator_firstname ?? ""} ${
              invitation?.creator_lastname ?? ""
            }`}
          </p>

          {invitation?.message && (
            <p className="invitation-message">
              "{invitation.message.trim()}"
            </p>
          )}

          <div className="invitation-actions">
            <button
              type="button"
              className="invitation-btn-primary"
              onClick={() =>
                invitationResponded("accepted")
              }
            >
              Accepter
            </button>

            <button
              type="button"
              className="invitation-btn-outline"
              onClick={() =>
                invitationResponded("refused")
              }
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