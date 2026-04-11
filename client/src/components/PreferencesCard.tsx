import { useEffect, useState } from "react";
import { Bell, ChevronRight, Euro, Moon, Sun } from "lucide-react";
import "../pages/styles/PreferencesCard.css";

type Currency = "EUR" | "USD" | "GBP";

interface Preferences {
  theme: "light" | "dark";
  currency: Currency;
  notifications: boolean;
}

function PreferencesCard() {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "light",
    currency: "EUR",
    notifications: true,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences");

    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Erreur lors de la lecture des préférences :", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    document.body.setAttribute("data-theme", preferences.theme);
  }, [preferences]);

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  const toggleNotifications = () => {
    setPreferences((prev) => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  const handleCurrencyChange = () => {
    const currencies: Currency[] = ["EUR", "USD", "GBP"];
    const currentIndex = currencies.indexOf(preferences.currency);
    const nextCurrency = currencies[(currentIndex + 1) % currencies.length];

    setPreferences((prev) => ({
      ...prev,
      currency: nextCurrency,
    }));
  };

  const getCurrencyLabel = (currency: Currency) => {
    switch (currency) {
      case "EUR":
        return "Euro (€)";
      case "USD":
        return "Dollar ($)";
      case "GBP":
        return "Livre sterling (£)";
      default:
        return "Euro (€)";
    }
  };

  return (
    <section className="preferences-card">
      <h2 className="preferences-title">Préférences</h2>

      <div className="preferences-list">
        <div className="preference-item">
          <div className="preference-left">
            <div className="icon-wrapper theme-icon">
              {preferences.theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
            </div>
            <span className="preference-text">
              <strong>Thème :</strong>{" "}
              {preferences.theme === "light" ? "Clair" : "Sombre"}
            </span>
          </div>

          <button
            type="button"
            className={`toggle-switch ${preferences.theme === "dark" ? "active" : ""}`}
            onClick={toggleTheme}
            aria-label="Changer le thème"
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <button
          type="button"
          className="preference-item preference-button"
          onClick={handleCurrencyChange}
        >
          <div className="preference-left">
            <div className="icon-wrapper currency-icon">
              <Euro size={22} />
            </div>
            <span className="preference-text">
              <strong>Devise :</strong> {getCurrencyLabel(preferences.currency)}
            </span>
          </div>

          <ChevronRight size={22} className="chevron-icon" />
        </button>

        <div className="preference-item">
          <div className="preference-left">
            <div className="icon-wrapper notification-icon">
              <Bell size={22} />
            </div>
            <span className="preference-text">
              <strong>Notifications :</strong>{" "}
              {preferences.notifications ? "Activées" : "Désactivées"}
            </span>
          </div>

          <button
            type="button"
            className={`toggle-switch ${preferences.notifications ? "active" : ""}`}
            onClick={toggleNotifications}
            aria-label="Activer ou désactiver les notifications"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default PreferencesCard;