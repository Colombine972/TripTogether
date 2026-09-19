import { Crown } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router";

import PremiumComingSoonModal from "./PremiumComingSoonModal";
import "../pages/styles/NavTabs.css";

const NavTabs = () => {
  const { id } = useParams<{
    id: string;
  }>();

  const location = useLocation();

  const [premiumFeatureName, setPremiumFeatureName] = useState("");

  /* =========================================================
     VÉRIFIER SI UN ONGLET EST ACTIF
     ========================================================= */

  const isActive = (path: string) => {
    const currentPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;

    const targetPath = path.endsWith("/") ? path.slice(0, -1) : path;

    return currentPath === targetPath;
  };

  /* =========================================================
     ROUTES DU VOYAGE
     ========================================================= */

  const recapPath = id ? `/trip/${id}` : "/";

  const stepsPath = id ? `/trip/${id}/steps` : "/";

  const membersPath = id ? `/trip/${id}/invitations` : "/";

  const budgetPath = id ? `/trip/${id}/budget` : "/";

  /* =========================================================
     RENDU
     ========================================================= */

  return (
    <>
      <section className="nav-tabs">
        {/* =====================================================
          RÉCAPITULATIF
          ===================================================== */}

        <NavLink
          to={recapPath}
          className={() => `tab ${isActive(recapPath) ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Récap Voyage</title>

            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>

          <span className="tab-label">Récap</span>
        </NavLink>

        {/* =====================================================
          DESTINATIONS / ÉTAPES
          ===================================================== */}

        <NavLink
          to={stepsPath}
          className={() => `tab ${isActive(stepsPath) ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Destinations</title>

            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>

          <span className="tab-label">Destinations</span>
        </NavLink>

        {/* =====================================================
          MEMBRES
          ===================================================== */}

        <NavLink
          to={membersPath}
          className={() => `tab ${isActive(membersPath) ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Membres</title>

            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>

          <span className="tab-label">Membres</span>
        </NavLink>

        {/* =====================================================
          BUDGET
          ===================================================== */}

        <NavLink
          to={budgetPath}
          className={() => `tab ${isActive(budgetPath) ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Budget</title>

            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-2.59-2.58L12 10l-4 4h12z" />
          </svg>

          <span className="tab-label">Budget</span>
        </NavLink>

        {/* =====================================================
          MAPS - À VENIR
          ===================================================== */}

        <button
          type="button"
          className="tab tab-premium"
          onClick={() => setPremiumFeatureName("Carte interactive")}
          aria-label="Carte interactive Premium bientôt disponible"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Carte interactive Premium</title>

            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>

          <span className="tab-label">Maps</span>

          <Crown size={13} className="tab-premium-crown" aria-hidden="true" />
        </button>

        {/* =====================================================
    ASSISTANT IA PREMIUM
===================================================== */}

        <button
          type="button"
          className="tab tab-premium"
          onClick={() => setPremiumFeatureName("Assistant IA")}
          aria-label="Assistant IA Premium bientôt disponible"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
            <title>Assistant IA Premium</title>

            <path d="M12 2a2 2 0 0 1 2 2v1.05A7.002 7.002 0 0 1 19 12v4a3 3 0 0 1-3 3h-1.5l-1.6 2.13a1.13 1.13 0 0 1-1.8 0L9.5 19H8a3 3 0 0 1-3-3v-4a7.002 7.002 0 0 1 5-6.95V4a2 2 0 0 1 2-2Zm-3 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-6 4.5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
          </svg>

          <span className="tab-label">Assistant IA</span>

          <Crown size={13} className="tab-premium-crown" aria-hidden="true" />
        </button>
      </section>
      <PremiumComingSoonModal
        isOpen={premiumFeatureName !== ""}
        onClose={() => setPremiumFeatureName("")}
        featureName={premiumFeatureName}
      />
    </>
  );
};

export default NavTabs;
