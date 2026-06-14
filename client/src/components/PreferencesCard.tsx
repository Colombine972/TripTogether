import { Bell, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CURRENCIES } from "../constants/currencies";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";

type PreferencesType = {
  email_trip_notifications: boolean;
  default_currency: string;
};

const MAIN_CURRENCY_CODES = ["EUR", "USD", "GBP"];

export default function PreferencesCard() {
  const { auth } = useAuth();

  const [preferences, setPreferences] = useState<PreferencesType>({
    email_trip_notifications: true,
    default_currency: "EUR",
  });

  const [loading, setLoading] = useState(true);

  const mainCurrencies = useMemo(
    () =>
      MAIN_CURRENCY_CODES.map((code) => ({
        code,
        ...CURRENCIES[code as keyof typeof CURRENCIES],
      })),
    [],
  );

  const otherCurrencies = useMemo(
    () =>
      Object.entries(CURRENCIES)
        .filter(([code]) => !MAIN_CURRENCY_CODES.includes(code))
        .sort(([, currencyA], [, currencyB]) =>
          currencyA.name.localeCompare(currencyB.name, "fr"),
        ),
    [],
  );

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
          default_currency: data.default_currency || "EUR",
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

  const updatePreferences = async (updatedPreferences: PreferencesType) => {
    const previousPreferences = preferences;

    setPreferences(updatedPreferences);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(updatedPreferences),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur mise à jour");
      }

      toast.success("Préférences enregistrées.");
    } catch (error) {
      console.error(error);
      setPreferences(previousPreferences);
      toast.error("Erreur lors de la mise à jour des préférences.");
    }
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePreferences({
      ...preferences,
      email_trip_notifications: event.target.checked,
    });
  };

  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    updatePreferences({
      ...preferences,
      default_currency: event.target.value,
    });
  };

  return (
    <div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="preferences-list">
          <div className="preference-row">
            <div className="preference-icon">
              <Bell size={22} />
            </div>

            <div className="preference-content">
              <p className="preference-title">Notifications du voyage</p>
              <p>
                Recevoir un email lors d’une activité sur un voyage auquel je
                participe
              </p>

              <label className="preference-checkbox">
                <input
                  type="checkbox"
                  checked={preferences.email_trip_notifications}
                  onChange={handleToggle}
                />
                Activer les notifications
              </label>
            </div>
          </div>

          <div className="preference-row">
            <div className="preference-icon">
              <Coins size={22} />
            </div>

            <div className="preference-content">
              <p className="preference-title">Devise d’équilibrage préférée</p>
              <p>
                Cette devise sera utilisée par défaut pour les comptes, les
                remboursements et l’affichage des conversions.
              </p>

              <select
                className="currency-select"
                value={preferences.default_currency}
                onChange={handleCurrencyChange}
              >
                <optgroup label="Devises principales">
                  {mainCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Autres devises disponibles">
                  {otherCurrencies.map(([code, currency]) => (
                    <option key={code} value={code}>
                      {code} — {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}