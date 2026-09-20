import { useState } from "react";

import {
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Crown,
  FileDown,
  MapPin,
  PiggyBank,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";

import HomeFeatureCarousel from "../components/HomeFeatureCarousel";
import PremiumComingSoonModal from "../components/PremiumComingSoonModal";
import "./styles/Home.css";

function HomePage() {
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");

  const openPremiumModal = (featureName: string) => {
    setPremiumFeatureName(featureName);
    setIsPremiumModalOpen(true);
  };

  const closePremiumModal = () => {
    setIsPremiumModalOpen(false);
    setPremiumFeatureName("");
  };
  return (
    <main className="home-page">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="home-hero">
        <div className="home-hero-content">
          {/* =================================================
              TEXTE HERO
          ================================================== */}

          <div className="home-hero-text">
            <h1>
              Planifiez vos
              <br />
              aventures ensemble
            </h1>

            <h2>
              Organisez vos voyages
              <br />
              en groupe simplement
            </h2>

            <p>
              Créez un voyage, invitez vos amis, votez pour vos destinations
              préférées et partagez les dépenses. Tout ça au même endroit.
            </p>

            <div className="home-hero-actions">
              <Link to="/create-trip" className="home-primary-btn">
                Organiser mon voyage
                <span aria-hidden="true">→</span>
              </Link>

              <Link to="/my-trips" className="home-secondary-btn">
                Voir mes voyages
              </Link>
            </div>
          </div>

          {/* =================================================
              CARTES FLOTTANTES
          ================================================== */}

          <div className="home-hero-visual">
            <div className="hero-floating-card hero-card-travelers">
              <span className="hero-floating-icon">
                <Users size={26} />
              </span>

              <div className="hero-floating-content">
                <strong>5 voyageurs</strong>
                <span>prêts à partir</span>
              </div>
            </div>

            <div className="hero-floating-card hero-card-destination">
              <span className="hero-floating-icon">
                <MapPin size={25} />
              </span>

              <div className="hero-floating-content">
                <strong>Lisbonne</strong>
                <span>8 votes</span>
              </div>
            </div>

            <div className="hero-floating-card hero-card-budget">
              <span className="hero-floating-icon">
                <WalletCards size={25} />
              </span>

              <div className="hero-floating-content">
                <span>Budget total</span>
                <strong className="hero-floating-amount">1 248 €</strong>
              </div>
            </div>

            <div className="hero-floating-card hero-card-balance">
              <span className="hero-floating-icon">
                <CircleDollarSign size={26} />
              </span>

              <div className="hero-floating-content">
                <span>Solde</span>
                <strong className="hero-floating-amount">+42,50 €</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CARROUSEL DES FONCTIONNALITÉS
      ====================================================== */}

      <HomeFeatureCarousel />

      {/* =====================================================
          PREMIUM
      ====================================================== */}

      <section className="home-premium">
        <header className="home-premium-header">
          <h2>
            Passez à la <span>préparation complète</span> de votre voyage
          </h2>

          <p>
            Un seul paiement débloque les outils Premium pour tout le groupe.
          </p>
        </header>

        <div className="premium-features-grid">
          {/* =================================================
              SUGGESTIONS INTELLIGENTES
          ================================================== */}

          <button
            type="button"
            className="premium-feature-card premium-feature-card-clickable"
            onClick={() => openPremiumModal("Suggestions intelligentes")}
          >
            <div className="premium-card-top">
              <div className="premium-feature-icon">
                <Sparkles />
              </div>

              <span className="premium-badge">
                <Crown size={14} />
                PREMIUM
              </span>
            </div>

            <h3>Suggestions intelligentes</h3>

            <p>
              Découvrez des idées de destinations et d'activités adaptées à
              votre groupe.
            </p>

            <div className="premium-demo premium-suggestion-demo">
              <div className="premium-destination-photo">
                <img src="lisbonne.png" alt="Lisbonne" />
              </div>

              <div className="premium-destination-label">
                <MapPin size={16} />

                <div>
                  <strong>Destinations suggérées</strong>
                  <span>5 lieux pour votre groupe</span>
                </div>
              </div>
            </div>
          </button>

          {/* =================================================
              CHECKLIST
          ================================================== */}

          <button
            type="button"
            className="premium-feature-card premium-feature-card-clickable"
            onClick={() => openPremiumModal("Checklist collaborative")}
          >
            <div className="premium-card-top">
              <div className="premium-feature-icon">
                <ClipboardCheck />
              </div>

              <span className="premium-badge">
                <Crown size={14} />
                PREMIUM
              </span>
            </div>

            <h3>Checklist collaborative</h3>

            <p>
              Préparez votre voyage ensemble avec des listes personnalisées.
            </p>

            <div className="premium-demo premium-checklist-demo">
              <div className="premium-check-row checked">
                <span className="premium-checkbox">
                  <Check size={14} />
                </span>
                Réserver l'hébergement
              </div>

              <div className="premium-check-row">
                <span className="premium-checkbox" />
                Vérifier les passeports
              </div>

              <div className="premium-check-row">
                <span className="premium-checkbox" />
                Prévoir l'assurance voyage
              </div>

              <div className="premium-check-row">
                <span className="premium-checkbox" />
                Faire la valise
              </div>
            </div>
          </button>

          {/* =================================================
              BUDGET PRÉVISIONNEL
          ================================================== */}

          <button
            type="button"
            className="premium-feature-card premium-feature-card-clickable"
            onClick={() => openPremiumModal("Budget prévisionnel")}
          >
            <div className="premium-card-top">
              <div className="premium-feature-icon">
                <PiggyBank />
              </div>

              <span className="premium-badge">
                <Crown size={14} />
                PREMIUM
              </span>
            </div>

            <h3>Budget prévisionnel</h3>

            <p>Estimez et planifiez les dépenses avant même votre départ.</p>

            <div className="premium-demo premium-budget-demo">
              <span>Budget estimé</span>
              <strong>1 500,00 €</strong>

              <div className="premium-budget-row">
                <span>Logement</span>
                <div>
                  <i style={{ width: "72%" }} />
                </div>
                <small>40%</small>
              </div>

              <div className="premium-budget-row">
                <span>Transports</span>
                <div>
                  <i style={{ width: "50%" }} />
                </div>
                <small>25%</small>
              </div>

              <div className="premium-budget-row">
                <span>Activités</span>
                <div>
                  <i style={{ width: "38%" }} />
                </div>
                <small>20%</small>
              </div>

              <div className="premium-budget-row">
                <span>Repas</span>
                <div>
                  <i style={{ width: "28%" }} />
                </div>
                <small>15%</small>
              </div>
            </div>
          </button>

          {/* =================================================
              EXPORT
          ================================================== */}

          <button
            type="button"
            className="premium-feature-card premium-feature-card-clickable"
            onClick={() => openPremiumModal("Export du voyage")}
          >
            <div className="premium-card-top">
              <div className="premium-feature-icon">
                <FileDown />
              </div>

              <span className="premium-badge">
                <Crown size={14} />
                PREMIUM
              </span>
            </div>

            <h3>Export du voyage</h3>

            <p>
              Générez un carnet de voyage complet à partager avec tout le
              groupe.
            </p>

            <div className="premium-demo premium-export-demo">
              <div className="premium-export-document">
                <div className="premium-export-logo">
                  <Crown size={17} />
                  TripTogether
                </div>

                <strong>Road trip Portugal</strong>

                <div className="premium-export-image">
                  <img src="portugal.png" alt="Portugal" />
                </div>

                <span>Votre voyage en un seul document</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* =====================================================
    TARIFS
====================================================== */}

      <section className="home-pricing" id="tarifs">
        <header className="home-pricing-header">
          <h2>
            Des tarifs <span>simples et transparents</span>
          </h2>

          <p>
            Commencez gratuitement et passez au Premium pour aller plus loin
            dans la préparation de votre voyage.
          </p>
        </header>

        <div className="pricing-grid">
          {/* =================================================
        FREE
    ================================================== */}

          <article className="pricing-card pricing-free">
            <div className="pricing-card-heading">
              <h3>TripTogether Free</h3>

              <span className="pricing-free-badge">GRATUIT</span>
            </div>

            <div className="pricing-price">
              <strong>0 €</strong>
            </div>

            <p className="pricing-description">
              Tout ce qu'il faut pour organiser un voyage avec vos proches.
            </p>

            <ul className="pricing-features">
              <li>
                <Check size={18} />
                Création et gestion de vos voyages
              </li>

              <li>
                <Check size={18} />
                Invitations et participants
              </li>

              <li>
                <Check size={18} />
                Étapes et votes
              </li>

              <li>
                <Check size={18} />
                Budget partagé
              </li>

              <li>
                <Check size={18} />
                Dépenses et remboursements
              </li>

              <li>
                <Check size={18} />
                Récapitulatif du voyage
              </li>
            </ul>

            <Link to="/create-trip" className="pricing-free-btn">
              Créer mon voyage gratuitement
            </Link>
          </article>

          {/* =================================================
        PREMIUM
    ================================================== */}

          <article className="pricing-card pricing-premium">
            <div className="pricing-coming-soon">
              <Crown size={14} />
              PREMIUM BIENTÔT DISPONIBLE
            </div>

            <div className="pricing-card-heading pricing-premium-heading">
              <h3>Voyage Premium</h3>

              <span className="pricing-premium-badge">
                <Crown size={14} />
                PREMIUM
              </span>
            </div>

            <div className="pricing-price pricing-premium-price">
              <strong>5,99 €</strong>
              <span>/ voyage</span>
            </div>

            <p className="pricing-description">
              Un seul paiement par l'organisateur pour débloquer les outils
              Premium du voyage.
            </p>

            <ul className="pricing-features">
              <li>
                <Check size={18} />
                Toutes les fonctionnalités Free
              </li>

              <li>
                <Check size={18} />
                Budget prévisionnel
              </li>

              <li>
                <Check size={18} />
                Checklist collaborative
              </li>

              <li>
                <Check size={18} />
                Planning détaillé
              </li>

              <li>
                <Check size={18} />
                Informations pratiques
              </li>

              <li>
                <Check size={18} />
                Export du voyage
              </li>
            </ul>

            <button
              type="button"
              className="pricing-premium-btn"
              onClick={() => openPremiumModal("TripTogether Premium")}
            >
              <Crown size={18} />
              Premium bientôt disponible
            </button>
          </article>
        </div>

        <div className="pricing-bottom-note">
          <span>✓ Sans abonnement</span>
          <span>✓ Paiement unique par voyage</span>
          <span>✓ Premium pour tout le groupe</span>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="home-faq" id="faq">
        <header className="home-faq-header">
          <h2>
            Questions <span>fréquentes</span>
          </h2>
        </header>

        <div className="faq-list">
          <details className="faq-item">
            <summary>
              <span>TripTogether est-il vraiment gratuit ?</span>
              <ChevronDown size={20} />
            </summary>

            <p>
              Oui. Vous pouvez créer votre voyage, inviter vos proches, proposer
              des étapes, voter et gérer les dépenses gratuitement.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>Comment fonctionnera le paiement du Premium ?</span>
              <ChevronDown size={20} />
            </summary>

            <p>
              Le Premium sera proposé avec un paiement unique par voyage, sans
              abonnement mensuel.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>Tout le groupe devra-t-il payer ?</span>
              <ChevronDown size={20} />
            </summary>

            <p>
              Non. Un seul paiement effectué par l'organisateur débloquera les
              fonctionnalités Premium pour le voyage concerné.
            </p>
          </details>
        </div>
      </section>
      <PremiumComingSoonModal
        isOpen={isPremiumModalOpen}
        onClose={closePremiumModal}
        featureName={premiumFeatureName}
      />
    </main>
  );
}

export default HomePage;
