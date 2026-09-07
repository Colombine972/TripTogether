import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";

import type { Step, TheTrip } from "../types/tripType";

import "./styles/Trip.css";

function Trip() {
  type RouteParams = {
    id: string;
  };

  const { id } = useParams<RouteParams>();

  const tripId = Number(id);

  const navigate = useNavigate();

  const { auth } = useAuth();

  const [steps, setSteps] = useState<Step[]>([]);

  const [myTrip, setMyTrip] = useState<TheTrip | null>(null);

  const [loading, setLoading] = useState(true);

  const token = auth?.token || localStorage.getItem("token");

  /* =========================================================
     CHARGEMENT DU VOYAGE ET DES ÉTAPES
  ========================================================= */

  useEffect(() => {
    if (!token) {
      toast.error("Veuillez vous connecter");

      navigate("/login", {
        replace: true,
      });

      return;
    }

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

    let cancelled = false;

    const loadTrip = async () => {
      setLoading(true);

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

        let tripData = null;

        try {
          tripData = await tripResponse.json();
        } catch {
          tripData = null;
        }

        /* =====================================================
           SESSION EXPIRÉE / NON AUTHENTIFIÉ
        ====================================================== */

        if (tripResponse.status === 401) {
          localStorage.removeItem("token");

          const message =
            tripData?.error === "Token expired"
              ? "Session expirée. Veuillez vous reconnecter."
              : "Veuillez vous connecter pour accéder à ce voyage.";

          toast.error(message);

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
           VOYAGE INEXISTANT
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

        /* =====================================================
           AUTRE ERREUR VOYAGE
        ====================================================== */

        if (!tripResponse.ok) {
          toast.error("Impossible de charger le voyage");

          return;
        }

        if (cancelled) return;

        setMyTrip(tripData);

        /* =====================================================
           ÉTAPES
        ====================================================== */

        const stepsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`,
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },
          },
        );

        let stepsData = null;

        try {
          stepsData = await stepsResponse.json();
        } catch {
          stepsData = null;
        }

        /* =====================================================
           SESSION EXPIRÉE / NON AUTHENTIFIÉ
        ====================================================== */

        if (stepsResponse.status === 401) {
          localStorage.removeItem("token");

          const message =
            stepsData?.error === "Token expired"
              ? "Session expirée. Veuillez vous reconnecter."
              : "Veuillez vous connecter pour accéder à ce voyage.";

          toast.error(message);

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* =====================================================
           ACCÈS NON AUTORISÉ
        ====================================================== */

        if (stepsResponse.status === 403) {
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
           VOYAGE / ÉTAPES INTROUVABLES
        ====================================================== */

        if (stepsResponse.status === 404) {
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

        /* =====================================================
           AUTRE ERREUR ÉTAPES
        ====================================================== */

        if (!stepsResponse.ok) {
          toast.error("Impossible de charger les étapes");

          return;
        }

        if (cancelled) return;

        setSteps(stepsData?.steps ?? []);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur chargement voyage :", error);

        toast.error(
          "Une erreur est survenue lors du chargement du voyage.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [tripId, token, navigate]);

  /* =========================================================
     MISE À JOUR DU VOYAGE
  ========================================================= */

  const handleTripUpdated = (updatedTrip: TheTrip) => {
    setMyTrip(updatedTrip);

    setSteps((previousSteps) =>
      previousSteps
        .filter(
          (step) =>
            step.is_initial ||
            step.country === updatedTrip.country,
        )
        .map((step) =>
          step.is_initial
            ? {
                ...step,

                city: updatedTrip.city,

                country: updatedTrip.country,

                place_id: updatedTrip.place_id,
              }
            : step,
        ),
    );
  };

  /* =========================================================
     PROGRESSION DES ÉTAPES
  ========================================================= */

  const validatedSteps = steps.filter(
    (step) => step.status === "validated",
  );

  const totalSteps = steps.length;

  const validatedStepsCount = validatedSteps.length;

  /* =========================================================
     AUTORISATION DE MODIFICATION
  ========================================================= */

  const canEditTrip =
    Boolean(myTrip) &&
    Boolean(auth?.user?.id) &&
    Number(auth?.user?.id) === Number(myTrip?.user_id);

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <>
      {!loading && myTrip && (
        <TripInfos
          trip={myTrip}
          onTripUpdated={handleTripUpdated}
          totalSteps={totalSteps}
          validatedStepsCount={validatedStepsCount}
          steps={steps}
          canEdit={canEditTrip}
        />
      )}
    </>
  );
}

export default Trip;