import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";

type PreferencesType = {
  email_trip_notifications: boolean;
};

export default function PreferencesCard() {
  const { auth } = useAuth();

  const [preferences, setPreferences] = useState<PreferencesType>({
    email_trip_notifications: true,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/preferences`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erreur récupération préférences");
        }

        const data = await response.json();

        setPreferences({
          email_trip_notifications: Boolean(data.email_trip_notifications),
        });
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement des préférences.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchPreferences();
    }
  }, [auth?.token]);

  const handleToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;

    setPreferences({
      email_trip_notifications: checked,
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({
            email_trip_notifications: checked,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur mise à jour");
      }

      toast.success("Préférences enregistrées.");
    } catch (error) {
      console.error(error);

      setPreferences({
        email_trip_notifications: !checked,
      });

      toast.error("Erreur lors de la mise à jour des préférences.");
    }
  };

  return (
    <div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <label className="preference-item">
          <input
            type="checkbox"
            checked={preferences.email_trip_notifications}
            onChange={handleToggle}
          />

          <div className="preference-text">
            <p className="preference-title">Notifications du voyage</p>
            <p>
              Recevoir un email lors d’une activité sur un voyage auquel je
              participe
            </p>
          </div>
        </label>
      )}
    </div>
  );
}