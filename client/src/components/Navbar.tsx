import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "../components/NotificationBell";
import "../pages/styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();

  const [openNavBar, setOpenNavBar] = useState(false);

  const pageTitles: Record<string, string> = {
    "/account": "Mon compte",
    "/my-trips": "Mes voyages",
  };

  const pageTitle = pageTitles[location.pathname] || "";

  function closeMenu() {
    setOpenNavBar(false);
  }

  function toggleMenu() {
    setOpenNavBar((prev) => !prev);
  }

  function navigateToCreateTrip() {
    navigate("/create-trip");
    closeMenu();
  }

  function getGreeting() {
    const hour = new Date().getHours();

    return hour < 17 ? "Bonjour" : "Bonsoir";
  }

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link
            to="/"
            onClick={closeMenu}
            className="navbar-logo-link"
          >
            <img
              src="/logos/logo.png"
              className="navbar-logo"
              alt="Logo Trip Together"
            />
          </Link>

          <Link
            to="/"
            onClick={closeMenu}
            className="navbar-brand-link"
          >
            <span className="website-name">
              Trip Together
            </span>
          </Link>
        </div>

        <div className="navbar-center">
          {pageTitle && (
            <p className="navbar-page-title">
              {pageTitle}
            </p>
          )}
        </div>

        <div className="navbar-right">
          {auth && (
            <>
              <button
                type="button"
                className="navbar-cta"
                onClick={navigateToCreateTrip}
              >
                Crée ton voyage !
              </button>

              <NotificationBell />
            </>
          )}

          <div
            className="navbar-profile"
            onMouseEnter={() => setOpenNavBar(true)}
            onMouseLeave={() => setOpenNavBar(false)}
          >
            {auth ? (
              <>
                <button
                  type="button"
                  className={`navbar-profile-button ${
                    openNavBar ? "is-active" : ""
                  }`}
                  aria-label="Ouvrir le menu profil"
                  aria-expanded={openNavBar}
                  onClick={toggleMenu}
                >
                  <img
                    src={
                      auth.user.avatar_url ||
                      "/images/utilisateur.png"
                    }
                    className="user-icon"
                    alt="Avatar utilisateur"
                  />
                </button>

                <div
                  className={`navbar-menu ${
                    openNavBar ? "is-open" : ""
                  }`}
                  role="menu"
                >
                  <p className="navbar-greeting">
                    {getGreeting()}{" "}
                    {auth.user.firstname}
                  </p>

                  <div className="navbar-menu-links">
                    <Link
                      className="navbar-menu-link"
                      to="/account"
                      onClick={closeMenu}
                    >
                      Mon compte
                    </Link>

                    <button
                      type="button"
                      className="navbar-logout-btn"
                      onClick={handleLogout}
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="navbar-auth-links">
                <Link
                  to="/login"
                  className="navbar-auth-link"
                >
                  Se connecter
                </Link>

                <Link
                  to="/register"
                  className="navbar-auth-link navbar-auth-register"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}