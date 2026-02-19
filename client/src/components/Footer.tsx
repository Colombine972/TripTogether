import "../pages/styles/Footer.css";
import { Link } from "react-router";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <hr className="footer-divider" />
      <article className="footer-content">
        <Link to="/" onClick={() => window.scrollTo({ top: 0 })}>
          <div className="footer-left">
            <img
              src="/logos/logo.png"
              alt="Trip Together logo"
              className="footer-logo"
            />
            Trip Together
          </div>
        </Link>

        <div className="footer-right">
          &copy; {year} TripTogether.{" "}
          <span className="footer-heart">Fait avec ❤️ pour les voyageurs.</span>
        </div>
      </article>
    </footer>
  );
}

export default Footer;
