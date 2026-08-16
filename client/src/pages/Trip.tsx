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
      navigate("/login");

      toast.error("Veuillez vous connecter");

      return;
    }

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

    /* =====================================================
       VOYAGE
    ====================================================== */

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.status === 401) {
          if (data.error === "Token expired") {
            localStorage.removeItem("token");

            navigate("/login");

            toast.error("Session expirée. Veuillez vous reconnecter.");

            return;
          }

          toast.error("Veuillez vous connecter pour accéder à ce voyage.");

          navigate("/login");

          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement voyage");
        }

        setMyTrip(data);
      })
      .catch((error) => {
        console.error(error);

        toast.error("Impossible de charger le voyage");
      })
      .finally(() => {
        setLoading(false);
      });

    /* =====================================================
       ÉTAPES
    ====================================================== */

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.status === 401) {
          if (data.error === "Token expired") {
            localStorage.removeItem("token");

            navigate("/login");

            toast.error("Session expirée. Veuillez vous reconnecter.");

            return;
          }

          toast.error("Veuillez vous connecter pour accéder à ce voyage.");

          navigate("/login");

          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement étapes");
        }

        setSteps(data.steps);
      })
      .catch((error) => {
        console.error(error);

        toast.error("Impossible de charger les étapes");
      });
  }, [tripId, token, navigate]);

  /* =========================================================
     MISE À JOUR DU VOYAGE
  ========================================================= */

  const handleTripUpdated = (updatedTrip: TheTrip) => {
    setMyTrip(updatedTrip);

    setSteps((previousSteps) =>
      previousSteps
        .filter(
          (step) => step.is_initial || step.country === updatedTrip.country,
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

  const validatedSteps = steps.filter((step) => step.status === "validated");

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