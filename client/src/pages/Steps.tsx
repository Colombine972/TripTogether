import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import AddStep from "../components/AddTrip";
import NavTabs from "../components/NavTabs";
import StepCard from "../components/StepCard";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import type { Step, StepsResponse, TheTrip } from "../types/tripType";
import "./styles/Steps.css";

type RouteParams = {
  id: string;
};

function Steps() {
  const { id } = useParams<RouteParams>();
  const tripId = Number(id);
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TheTrip | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const loading = loadingTrip || loadingSteps;

  const { auth, logout } = useAuth();
  const currentUserId = auth?.user?.id || 0;
  const token = auth?.token;

  const fetchTrip = useCallback(async () => {
    try {
      setLoadingTrip(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        if (data.error === "Token expired") {
          logout();
          toast.error("Session expirée. Veuillez vous reconnecter.");
          navigate("/login");
          return;
        }
        logout();
        toast.error("Veuillez vous connecter pour accéder à ce voyage.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur chargement voyage");
      }

      setTrip(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le voyage");
    } finally {
      setLoadingTrip(false);
    }
  }, [tripId, token, logout, navigate]);

  const fetchSteps = useCallback(async () => {
    try {
      setLoadingSteps(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      const result: StepsResponse = await response.json();

      if (response.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      if (response.status === 400) {
        toast.error("Requête invalide");
        navigate("/");
        return;
      }

      if (response.status === 403) {
        toast.error("Accès non autorisé");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur chargement étapes");
      }

      if (!("steps" in result)) {
        toast.error("Données d'étapes invalides");
        return;
      }

      setSteps(result.steps);
      setMemberCount(result.trip.memberCount);
    } catch (err) {
      console.error("Erreur fetch steps:", err);
      toast.error("Impossible de charger les étapes");
    } finally {
      setLoadingSteps(false);
    }
  }, [tripId, token, logout, navigate]);

  useEffect(() => {
    if (!id || Number.isNaN(tripId)) {
      toast.error("Voyage invalide");
      navigate("/");
      return;
    }

    fetchTrip();
    fetchSteps();
  }, [id, tripId, fetchTrip, fetchSteps, navigate]);

  const pendingSteps = steps.filter((s) => s.status === "pending");
  const validatedSteps = steps.filter((s) => s.status === "validated");
  const rejectedSteps = steps.filter((s) => s.status === "rejected");

  return (
    <>
      {!loading && trip && <TripInfos trip={trip} />}
      <section className="steps-page">
        <NavTabs />

        <AddStep onStepAdded={fetchSteps} />

        <section className="steps-list">
          {loading && <p className="loading-text">Chargement des étapes</p>}

          {!loading && (
            <>
              {pendingSteps.length > 0 && (
                <div className="steps-section">
                  <h2 className="section-title">
                    Étapes en attente du vote des membres ({pendingSteps.length}
                    )
                  </h2>
                  <p className="section-subtitle">
                    Votez pour les destinations ci-dessous. <br />
                    Pour valider une étape, tous les membres doivent avoir voté,
                    avec une majorité de OUI.
                  </p>
                  <div className="steps-container">
                    {pendingSteps.map((step) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        currentUserId={currentUserId}
                        tripId={tripId}
                        memberCount={memberCount}
                        onVoteSuccess={fetchSteps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {validatedSteps.length > 0 && (
                <div className="steps-section validated-section">
                  <h2 className="section-title">
                    Étapes validées ({validatedSteps.length})
                  </h2>
                  <p className="section-subtitle">
                    Ces étapes ont été approuvées par la majorité.
                  </p>
                  <div className="steps-container">
                    {validatedSteps.map((step) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        currentUserId={currentUserId}
                        tripId={tripId}
                        memberCount={memberCount}
                        onVoteSuccess={fetchSteps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {rejectedSteps.length > 0 && (
                <div className="steps-section rejected-section">
                  <h2 className="section-title">
                    Étapes rejetées ({rejectedSteps.length})
                  </h2>
                  <p className="section-subtitle">
                    Ces étapes n'ont pas obtenu la majorité.
                  </p>
                  <div className="steps-container">
                    {rejectedSteps.map((step) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        currentUserId={currentUserId}
                        tripId={tripId}
                        memberCount={memberCount}
                        onVoteSuccess={fetchSteps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {steps.length === 0 && (
                <p className="no-steps">Aucune étape pour le moment</p>
              )}
            </>
          )}
        </section>
      </section>
    </>
  );
}

export default Steps;
