import "../pages/styles/Footer.css";
import { Link } from "react-router";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <hr className="footer-divider" />
      <article className="footer-content">
        <div className="footer-left">
          <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
            <img
              src="/logos/logo.png"
              alt="Trip Together logo"
              className="footer-logo"
            />
            <span>Trip Together</span>
          </Link>
        </div>

        <div className="footer-center">
          <Link to="/privacy">Politique de confidentialité</Link>
          <Link to="/legal">Mentions légales</Link>
          <Link to="/terms">CGU</Link>
        </div>

        <div className="footer-right">
          &copy; {year} TripTogether.{" "}
          <span className="footer-heart">Fait avec ❤️ pour les voyageurs.</span>
        </div>
      </article>
    </footer>
  );
}

export default Footer;
