import { Link } from "react-router";
import "./styles/Home.css";
import { useEffect, useState } from "react";

function Home() {
  const [countTrip, setCountTrip] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/trips/count`).then(
      async (response) => {
        if (!response.ok) {
          console.error(
            "Backend erreur:",
            response.status,
            await response.json(),
          );
          throw new Error(`Erreur ${response.status}`);
        }
        const count = await response.json();
        setCountTrip(count);
      },
    );
  }, []);

  return (
    <div className="home">
      <section className="hero-section">
        <h1 className="hero-title">Planifiez vos aventures ensemble</h1>
        <h2 className="hero-subtitle">
          Organisez vos <span className="highlight">voyages en groupe</span>{" "}
          simplement
        </h2>
        <p className="hero-description">
          Créez un voyage, invitez vos amis, votez pour vos destinations
          préférées et partagez les dépenses. Tout ça au même endroit.
        </p>
        <div className="hero-cta">
          <Link to="/create-trip" className="btn-cta btn-primairy">
            Commencer maintenant
          </Link>
          <Link to="/my-trips" className="btn-cta btn-secondairy">
            Voir mes voyages
          </Link>
        </div>
      </section>

      <section className="image-section">
        <div className="image-container">
          <img
            src="/group-travelers.png"
            alt="Groupe de voyageurs"
            className="hero-image"
          />
          <div className="trips-badge">
            <svg
              className="badge-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Icône voyages"
            >
              <title>Icône voyages</title>
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="badge-text">
              {countTrip !== null
                ? `${countTrip} voyages ont déjà été créés`
                : "0"}
            </span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="features-title">Tout ce dont vous avez besoin</h2>
        <p className="hero-description">
          TripTogether simplifie l'organisation de vos voyages en groupe avec
          des outils puissants et intuitifs.
        </p>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <img
                src="/icon-group.png"
                alt="Icône représentant un groupe de personnes"
                className="feature-icon-img"
                width="40"
                height="40"
                aria-label="Voyager en groupe"
              />
            </div>
            <h3 className="feature-card-title">Voyager en groupe</h3>
            <p className="feature-card-description">
              Invitez vos amis et organisez ensemble votre prochain voyage
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img
                src="/icon-pin.png"
                alt="Icône représentant une épingle de localisation"
                className="feature-icon-img"
                width="40"
                height="40"
                aria-label="Voter pour les destinations"
              />
            </div>
            <h3 className="feature-card-title">Voter pour les destinations</h3>
            <p className="feature-card-description">
              Proposez des lieux et votez pour décider ensemble où aller.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img
                src="/icon-wallet.png"
                alt="Icône représentant un portefeuille"
                className="feature-icon-img"
                width="40"
                height="40"
                aria-label="Gérer les dépenses"
              />
            </div>
            <h3 className="feature-card-title">Gérez les dépenses</h3>
            <p className="feature-card-description">
              Partagez les frais équitablement et gardez une trace de tout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
