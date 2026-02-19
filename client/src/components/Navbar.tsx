import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../pages/styles/Navbar.css";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [openNavBar, setOpenNavBar] = useState(false);
  const { auth, logout } = useAuth();

  function navigateToCreateTrip() {
    navigate("/create-trip");
    closeMenu();
  }

  function toggleMenu() {
    setOpenNavBar((openNavBar) => !openNavBar);
  }

  function closeMenu() {
    setOpenNavBar(false);
  }

  function hello() {
    const now = new Date();
    const hour = now.getHours();
    return hour < 17 ? "Bonjour" : "Bonsoir";
  }

  const closelogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="navbar navbar-container">
      <div className="navbar-left">
        <Link to="/" onClick={closeMenu}>
          <img src="/logos/logo.png" className="navbar-logo" alt="Logo" />
        </Link>
        <Link to="/" onClick={closeMenu}>
          <div className="website-name">Trip Together</div>
        </Link>
      </div>

      <div className="navbar-center">
        <Link className="navbar-page-title" to="/my-trips" onClick={closeMenu}>
          Mes voyages
        </Link>
      </div>

      <div className="navbar-right">
        {auth && (
          <button
            type="button"
            className="navbar-cta"
            onClick={navigateToCreateTrip}
          >
            Crée ton voyage !
          </button>
        )}

        <div
          className="navbar-profile"
          onMouseEnter={() => setOpenNavBar(true)}
          onMouseLeave={() => setOpenNavBar(false)}
        >
          {auth ? (
            <div>
              <button
                type="button"
                className="navbar-profile-Button"
                aria-label="Profil"
                onClick={toggleMenu}
              >
                <img
                  src="/images/utilisateur.png"
                  className="user-icone"
                  alt=""
                />
              </button>

              <div
                className={`navbar-menu ${openNavBar ? "is-open" : ""}`}
                role="menu"
              >
                <div className="navbar-username">
                  <li>
                    {hello()} {auth.user.firstname}
                  </li>
                  <li className="navbar-menu-links">
                    <Link
                      className="navbar-menu-link navbar-menuLink"
                      to="/account"
                      onClick={closeMenu}
                    >
                      Mon compte
                    </Link>
                    <button
                      type="button"
                      className="logout-by navbar-logout-btn"
                      onClick={closelogout}
                    >
                      Logout
                    </button>
                  </li>
                </div>
              </div>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <li>
                <Link to="/login" className="navbar-auth-link">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="navbar-auth-link navbar-auth-register"
                >
                  Créer un compte
                </Link>
              </li>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
