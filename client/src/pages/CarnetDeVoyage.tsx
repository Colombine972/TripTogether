import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import "./styles/CarnetDeVoyage.css";

const ETSY_URL =
  "https://www.etsy.com/fr/listing/4612078525/carnet-de-voyage-interactif-pdf-20-pages";

const visuels = [
  {
    src: "/etsy/carnet-1.png",
    alt: "Présentation du carnet de voyage numérique",
  },
  { src: "/etsy/carnet-2.png", alt: "Aperçu du carnet de voyage interactif" },
  { src: "/etsy/carnet-3.png", alt: "Pages de préparation du voyage" },
  { src: "/etsy/carnet-4.png", alt: "Organisation et suivi du voyage" },
  { src: "/etsy/carnet-5.png", alt: "Import du carnet dans TripTogether" },
];

function CarnetDeVoyage() {
  return (
    <div className="carnet-page">
      <section className="carnet-hero">
        <div className="carnet-container carnet-hero-grid">
          <div className="carnet-hero-text">
            <span className="carnet-eyebrow">
              LE CARNET DE VOYAGE TRIPTOGETHER
            </span>

            <h1>
              Votre prochain voyage
              <span> commence ici.</span>
            </h1>

            <p>
              Imaginez, préparez et organisez votre prochaine aventure avec
              notre carnet de voyage numérique interactif. Un compagnon pour
              réunir toutes vos idées avant le départ.
            </p>

            <div className="carnet-actions">
              {ETSY_URL ? (
                <a
                  href={ETSY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="carnet-btn carnet-btn-primary"
                >
                  Découvrir le carnet sur Etsy
                  <ExternalLink size={18} />
                </a>
              ) : (
                <span className="carnet-link-pending">
                  Lien Etsy à ajouter avant publication
                </span>
              )}

              <a href="#decouvrir" className="carnet-btn carnet-btn-outline">
                Découvrir le carnet
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="carnet-highlights">
              <span>
                <CheckCircle2 size={17} /> Format PDF numérique
              </span>
              <span>
                <CheckCircle2 size={17} /> Interactif
              </span>
              <span>
                <CheckCircle2 size={17} /> Compatible TripTogether
              </span>
            </div>
          </div>

          <div className="carnet-hero-image">
            <img src={visuels[0].src} alt={visuels[0].alt} />
          </div>
        </div>
      </section>

      <section className="carnet-discovery" id="decouvrir">
        <div className="carnet-container">
          <header className="carnet-section-heading">
            <span className="carnet-eyebrow">DÉCOUVREZ LE CARNET</span>
            <h2>
              Tout commence par une <span>belle organisation.</span>
            </h2>
            <p>
              Découvrez les différentes facettes de notre carnet, pensé pour
              accompagner la préparation de vos aventures.
            </p>
          </header>

          <div className="carnet-gallery">
            {visuels.slice(1).map((visuel) => (
              <div className="carnet-gallery-card" key={visuel.src}>
                <img src={visuel.src} alt={visuel.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="carnet-benefits">
        <div className="carnet-container">
          <header className="carnet-section-heading">
            <h2>
              Un carnet, <span>mille possibilités.</span>
            </h2>
          </header>

          <div className="carnet-benefits-grid">
            <article className="carnet-benefit-card">
              <div className="carnet-benefit-icon">
                <BookOpen size={26} />
              </div>
              <h3>Préparez à votre rythme</h3>
              <p>
                Notez vos envies, vos idées et les informations utiles pour
                votre prochain voyage.
              </p>
            </article>

            <article className="carnet-benefit-card">
              <div className="carnet-benefit-icon">
                <CheckCircle2 size={26} />
              </div>
              <h3>Gardez tout au même endroit</h3>
              <p>
                Retrouvez vos préparatifs dans un document numérique pratique et
                interactif.
              </p>
            </article>

            <article className="carnet-benefit-card">
              <div className="carnet-benefit-icon">
                <Users size={26} />
              </div>
              <h3>Continuez ensemble</h3>
              <p>
                Importez votre carnet dans TripTogether pour transformer votre
                projet en voyage partagé.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="carnet-app">
        <div className="carnet-container carnet-app-grid">
          <div className="carnet-app-icon">
            <FileUp size={58} strokeWidth={1.5} />
          </div>

          <div>
            <span className="carnet-eyebrow">ET APRÈS ?</span>
            <h2>
              Votre carnet prend vie
              <span> avec TripTogether.</span>
            </h2>
            <p>
              Vous avez préparé votre voyage dans le carnet ? Importez-le dans
              l'application TripTogether, invitez vos proches, proposez des
              étapes, votez et partagez vos dépenses.
            </p>

            <Link to="/start" className="carnet-btn carnet-btn-primary">
              Découvrir TripTogether gratuitement
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="carnet-final">
        <div className="carnet-container">
          <h2>Prêt à imaginer votre prochaine aventure ?</h2>
          <p>
            Commencez à préparer vos plus beaux souvenirs avec le carnet de
            voyage TripTogether.
          </p>

          {ETSY_URL && (
            <a
              href={ETSY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="carnet-btn carnet-btn-primary"
            >
              Voir le carnet sur Etsy
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export default CarnetDeVoyage;
