import {
  useEffect,
  useState,
} from "react";
import {
  Outlet,
  useNavigate,
  useParams,
} from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";

function TripAccessGuard() {
  const { id } =
    useParams<{ id: string }>();

  const navigate =
    useNavigate();

  const { auth } =
    useAuth();

  const [authorized, setAuthorized] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const token =
    auth?.token ||
    localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      /* =====================================================
         PAS DE TOKEN
      ====================================================== */

      if (!token) {
        const manualLogout =
          sessionStorage.getItem(
            "manualLogout",
          ) === "true";

        /* ===================================================
           DÉCONNEXION VOLONTAIRE
           → PAS DE TOAST D'ERREUR
        ==================================================== */

        if (manualLogout) {
          sessionStorage.removeItem(
            "manualLogout",
          );

          navigate("/", {
            replace: true,
          });

          return;
        }

        /* ===================================================
           ACCÈS À UNE ROUTE PRIVÉE SANS SESSION
        ==================================================== */

        toast.error(
          "Veuillez vous connecter",
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /* =====================================================
         ID DU VOYAGE
      ====================================================== */

      const tripId =
        Number(id);

      if (
        !tripId ||
        Number.isNaN(tripId)
      ) {
        toast.error(
          "Voyage invalide",
        );

        navigate("/", {
          replace: true,
        });

        return;
      }

      try {
        /* ===================================================
           VÉRIFICATION ACCÈS VOYAGE
        ==================================================== */

        const response =
          await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/trips/${tripId}`,
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        if (cancelled) {
          return;
        }

        /* ===================================================
           SESSION EXPIRÉE / TOKEN INVALIDE
        ==================================================== */

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "token",
          );

          localStorage.removeItem(
            "auth",
          );

          toast.error(
            "Session expirée. Veuillez vous reconnecter.",
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* ===================================================
           ACCÈS INTERDIT
        ==================================================== */

        if (
          response.status === 403
        ) {
          toast.error(
            "Accès non autorisé à ce voyage",
          );

          navigate("/", {
            replace: true,
          });

          return;
        }

        /* ===================================================
           VOYAGE INTROUVABLE
        ==================================================== */

        if (
          response.status === 404
        ) {
          toast.error(
            "Ce voyage n'existe pas ou n'est plus disponible.",
          );

          navigate("/", {
            replace: true,
          });

          return;
        }

        /* ===================================================
           AUTRE ERREUR
        ==================================================== */

        if (!response.ok) {
          throw new Error(
            "Impossible de vérifier l'accès au voyage",
          );
        }

        /* ===================================================
           ACCÈS AUTORISÉ
        ==================================================== */

        setAuthorized(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Erreur vérification accès voyage :",
          error,
        );

        toast.error(
          "Impossible de vérifier l'accès au voyage.",
        );

        navigate("/", {
          replace: true,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    token,
    navigate,
  ]);

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (loading) {
    return null;
  }

  /* =========================================================
     ACCÈS REFUSÉ
  ========================================================= */

  if (!authorized) {
    return null;
  }

  /* =========================================================
     ROUTE AUTORISÉE
  ========================================================= */

  return <Outlet />;
}

export default TripAccessGuard;