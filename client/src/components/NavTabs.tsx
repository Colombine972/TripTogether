import { NavLink, useLocation, useParams } from "react-router";
import "../pages/styles/NavTabs.css";

const NavTabs = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Helper to check if a path matches the current location
  const isActive = (path: string) => {
    // Current path without trailing slash
    const currentPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;

    // Target path without trailing slash
    const targetPath = path.endsWith("/") ? path.slice(0, -1) : path;

    return currentPath === targetPath;
  };

  return (
    <section id="tabs">
      <NavLink
        to={id ? `/trip/${id}` : "/"}
        className={() =>
          `tab ${isActive(id ? `/trip/${id}` : "/") ? "active" : ""}`
        }
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Récap Voyage</title>
          <path d="M7 3h10c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 2v12h10V5H7zm2 7h8v2H9v-2zm0-4h6v2H9V6z" />
        </svg>
        <span className="tab-label">Récap</span>
      </NavLink>
      <NavLink
        to={id ? `/trip/${id}/steps` : "/"}
        className={() =>
          `tab ${isActive(id ? `/trip/${id}/steps` : "/") ? "active" : ""}`
        }
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Destinations</title>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span className="tab-label">Destinations</span>
      </NavLink>

      <NavLink
        to={id ? `/trip/${id}/invitations` : "/"}
        className={() =>
          `tab ${isActive(id ? `/trip/${id}/invitations` : "/") ? "active" : ""}`
        }
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Membres</title>
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
        <span className="tab-label">Membres</span>
      </NavLink>

      <NavLink
        to={id ? `/trip/${id}/budget` : "/"}
        className={() =>
          `tab ${isActive(id ? `/trip/${id}/budget` : "/") ? "active" : ""}`
        }
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Budget</title>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-2.59-2.58L12 10l-4 4h12z" />
        </svg>
        <span className="tab-label">Budget</span>
      </NavLink>

      <div className="tab inactive">
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Disponible prochaînement</title>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span className="tab-label">Maps</span>
      </div>

      <div className="tab inactive">
        <svg viewBox="0 0 24 24" fill="currentColor" className="tab-icon">
          <title>Disponible prochaînement</title>
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        <span className="tab-label">Chat</span>
      </div>
    </section>
  );
};

export default NavTabs;
