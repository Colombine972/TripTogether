import { useCallback, useEffect, useState } from "react";
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
     CHEMIN DE RETOUR VERS L'INVITATION
  ========================================================= */

  const getInvitationPath = useCallback(() => {
  if (!id || !invitationId) {
    return "/";
  }

  return `/trip/${id}/invitation/${invitationId}`;
}, [id, invitationId]);

const redirectToLogin = useCallback(
  (message?: string) => {
    if (message) {
      toast.error(message);
    }

    const invitationPath =
      getInvitationPath();

    navigate(
      `/login?redirect=${encodeURIComponent(
        invitationPath,
      )}`,
    );
  },
  [getInvitationPath, navigate],
);
  /* =========================================================
     CHARGEMENT DU VOYAGE ET DE L'INVITATION
  ========================================================= */

  useEffect(() => {
    /* =====================================================
       VÉRIFICATION DE L'INVITATION
    ====================================================== */

    if (!invitationId) {
      toast.error("Invitation invalide");

      navigate("/");

      return;
    }

    /* =====================================================
       UTILISATEUR NON CONNECTÉ
    ====================================================== */

    if (!auth?.token) {
      redirectToLogin();

      return;
    }

    /* =====================================================
       VOYAGE
    ====================================================== */

    fetch(
      `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
    )
      .then(async (response) => {
        /* =================================================
           SESSION EXPIRÉE / NON AUTHENTIFIÉ
        ================================================= */

        if (response.status === 401) {
          redirectToLogin(
            "Votre session a expiré. Veuillez vous reconnecter.",
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Erreur chargement voyage",
          );
        }

        const data =
          await response.json();

        setMyTrip(data);
      })
      .catch((error) => {
        console.error(error);

        toast.error(
          "Impossible de charger le voyage",
        );
      });

    /* =====================================================
       INVITATION
    ====================================================== */

    fetch(
      `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
      {
        headers: {
          Authorization:
            `Bearer ${auth.token}`,
        },
      },
    )
      .then(async (response) => {
        const invitationData =
          await response
            .json()
            .catch(() => null);

        /* =================================================
           SESSION EXPIRÉE / NON AUTHENTIFIÉ
        ================================================= */

        if (response.status === 401) {
          redirectToLogin(
            "Votre session a expiré. Veuillez vous reconnecter.",
          );

          return;
        }

        /* =================================================
           CONNECTÉ MAIS NON AUTORISÉ
        ================================================= */

        if (response.status === 403) {
          toast.error(
            invitationData?.error ||
              "Vous n'êtes pas autorisé à consulter cette invitation.",
          );

          navigate("/");

          return;
        }

        /* =================================================
           INVITATION INVALIDE / EXPIRÉE
        ================================================= */

        if (response.status === 400) {
          toast.error(
            invitationData?.message ||
              invitationData?.error ||
              "Invitation invalide ou expirée.",
          );

          navigate("/");

          return;
        }

        /* =================================================
           INVITATION INTROUVABLE
        ================================================= */

        if (response.status === 404) {
          toast.error(
            invitationData?.message ||
              invitationData?.error ||
              "Invitation introuvable.",
          );

          navigate("/");

          return;
        }

        /* =================================================
           INVITATION DÉJÀ ACCEPTÉE
        ================================================= */

        if (response.status === 409) {
          toast.error(
            invitationData?.message ||
              "Invitation déjà acceptée.",
          );

          navigate("/");

          return;
        }

        /* =================================================
           INVITATION DÉJÀ REFUSÉE
        ================================================= */

        if (response.status === 410) {
          toast.error(
            invitationData?.message ||
              "Invitation déjà refusée.",
          );

          navigate("/");

          return;
        }

        /* =================================================
           AUTRE ERREUR
        ================================================= */

        if (!response.ok) {
          throw new Error(
            "Erreur chargement invitation",
          );
        }

        setInvitation(
          invitationData,
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error(
          "Une erreur est survenue lors du chargement de l'invitation.",
        );

        navigate("/");
      });
  }, [
    navigate,
    invitationId,
    id,
    auth?.token,
    redirectToLogin,
  ]);

  /* =========================================================
     RÉPONSE À L'INVITATION
  ========================================================= */

  const invitationResponded = async (
    status: "accepted" | "refused",
  ) => {
    if (!invitationId) {
      return;
    }

    /* =====================================================
       UTILISATEUR NON CONNECTÉ
    ====================================================== */

    if (!auth?.token) {
      redirectToLogin(
        "Veuillez vous connecter pour répondre à cette invitation.",
      );

      return;
    }

    try {
      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${auth.token}`,
            },

            body: JSON.stringify({
              status,
            }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => null);

      /* =====================================================
         SESSION EXPIRÉE / NON CONNECTÉ
      ====================================================== */

      if (response.status === 401) {
        redirectToLogin(
          "Votre session a expiré. Veuillez vous reconnecter.",
        );

        return;
      }

      /* =====================================================
         NON AUTORISÉ
      ====================================================== */

      if (response.status === 403) {
        toast.error(
          data?.error ||
            "Vous n'êtes pas autorisé à répondre à cette invitation.",
        );

        return;
      }

      /* =====================================================
         INVITATION INVALIDE
      ====================================================== */

      if (response.status === 400) {
        toast.error(
          data?.error ||
            data?.message ||
            "Impossible de traiter cette invitation.",
        );

        return;
      }

      /* =====================================================
         INVITATION INTROUVABLE
      ====================================================== */

      if (response.status === 404) {
        toast.error(
          data?.error ||
            data?.message ||
            "Invitation introuvable.",
        );

        navigate("/");

        return;
      }

      /* =====================================================
         INVITATION DÉJÀ TRAITÉE
      ====================================================== */

      if (response.status === 409) {
        toast.error(
          data?.error ||
            data?.message ||
            "Cette invitation a déjà été traitée.",
        );

        navigate("/");

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      /* =====================================================
         INVITATION ACCEPTÉE
      ====================================================== */

      if (status === "accepted") {
        toast.success(
          "Invitation acceptée",
        );

        navigate(
          `/trip/${
            id ??
            invitation?.trip_id
          }`,
        );

        return;
      }

      /* =====================================================
         INVITATION REFUSÉE
      ====================================================== */

      toast.info(
        "Invitation refusée",
      );

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
        onTripUpdated={
          setMyTrip
        }
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
            {invitation?.invited_firstname
              ? `${invitation.invited_firstname}, vous avez été invité au voyage de`
              : "Vous avez été invité au voyage de"}
          </p>

          <img
            src={
              invitation?.creator_avatar_url ||
              "/profile-pic-logo.png"
            }
            alt={
              invitation?.creator_firstname
                ? `${invitation.creator_firstname} ${
                    invitation.creator_lastname ??
                    ""
                  }`
                : "Organisateur"
            }
            className="invitation-avatar"
          />

          <p className="invitation-inviter-name">
            {`${invitation?.creator_firstname ?? ""} ${
              invitation?.creator_lastname ??
              ""
            }`}
          </p>

          {invitation?.message && (
            <p className="invitation-message">
              "
              {
                invitation.message.trim()
              }
              "
            </p>
          )}

          <div className="invitation-actions">
            <button
              type="button"
              className="invitation-btn-primary"
              onClick={() =>
                invitationResponded(
                  "accepted",
                )
              }
            >
              Accepter
            </button>

            <button
              type="button"
              className="invitation-btn-outline"
              onClick={() =>
                invitationResponded(
                  "refused",
                )
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