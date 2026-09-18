import {
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Crown,
  FileDown,
  FileText,
  MapPin,
  PiggyBank,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";

import "./styles/Home.css";

function HomePage() {
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
          FEATURES
      ====================================================== */}

      <section className="home-features">
        <header className="home-features-header">
          <h2>
            Tout ce dont <span>vous avez besoin</span>
          </h2>

          <p>
            TripTogether simplifie l'organisation de vos voyages en groupe avec
            des outils puissants et intuitifs.
          </p>
        </header>

        <div className="home-features-grid">
          {/* =================================================
              VOYAGE EN GROUPE
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <Users />
            </div>

            <h3>Voyage en groupe</h3>

            <p>
              Invitez facilement vos proches et organisez votre prochain voyage
              ensemble.
            </p>

            <div className="feature-demo feature-participants-demo">
              <div className="participant-avatar">
                <img src="avatar1.png" alt="Cindy" />
              </div>

              <div className="participant-avatar">
                <img src="avatar2.png" alt="Anthony" />
              </div>

              <div className="participant-avatar">
                <img src="avatar3.png" alt="Marie" />
              </div>

              <div className="participant-avatar">
                <img src="avatar4.png" alt="Thomas" />
              </div>

              <div
                className="participant-add"
                aria-label="Inviter un participant"
              >
                +
              </div>
            </div>
          </article>

          {/* =================================================
              DESTINATIONS
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <MapPin />
            </div>

            <h3>Destinations</h3>

            <p>Proposez des lieux et votez ensemble pour décider où aller.</p>

            <div className="feature-demo destination-demo">
              <div className="destination-row destination-selected">
                <img
                  src="lisbonne.png"
                  alt="Lisbonne"
                  className="destination-thumbnail"
                />

                <div className="destination-content">
                  <strong>Lisbonne</strong>
                  <div className="destination-participants">
                    <img src="avatar1.png" alt="" />
                    <img src="avatar2.png" alt="" />
                    <img src="avatar3.png" alt="" />
                    <img src="avatar4.png" alt="" />
                  </div>
                </div>

                <span className="destination-votes active">8</span>
              </div>

              <div className="destination-row">
                <img
                  src="bali.png"
                  alt="Bali"
                  className="destination-thumbnail"
                />

                <div className="destination-content">
                  <strong>Bali</strong>
                  <div className="destination-participants">
                    <img src="avatar3.png" alt="" />
                    <img src="avatar1.png" alt="" />
                  </div>
                </div>

                <span className="destination-votes">5</span>
              </div>

              <div className="destination-row">
                <img
                  src="rome.png"
                  alt="Rome"
                  className="destination-thumbnail"
                />

                <div className="destination-content">
                  <strong>Rome</strong>
                  <div className="destination-participants">
                    <img src="avatar4.png" alt="" />
                    <img src="avatar2.png" alt="" />
                    <img src="avatar1.png" alt="" />
                  </div>
                </div>

                <span className="destination-votes">3</span>
              </div>
            </div>
          </article>

          {/* =================================================
              BUDGET PARTAGÉ
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <WalletCards />
            </div>

            <h3>Budget partagé</h3>

            <p>
              Ajoutez les dépenses et suivez le budget du voyage en temps réel.
            </p>

            <div className="feature-demo budget-demo">
              <div className="budget-demo-header">
                <span>Budget total</span>
                <strong>1 248,00 €</strong>
              </div>

              <div className="budget-visuals">
                <div className="budget-line-chart">
                  <svg
                    viewBox="0 0 180 85"
                    role="img"
                    aria-label="Évolution du budget"
                  >
                    <defs>
                      <linearGradient
                        id="budgetAreaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#dcefdc"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="100%"
                          stopColor="#dcefdc"
                          stopOpacity="0.15"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      className="budget-chart-area"
                      d="M5 65
             L28 45
             L52 56
             L78 43
             L105 56
             L135 39
             L175 20
             L175 80
             L5 80 Z"
                    />

                    <path
                      className="budget-chart-line"
                      d="M5 65
             L28 45
             L52 56
             L78 43
             L105 56
             L135 39
             L175 20"
                    />
                  </svg>
                </div>

                <div className="budget-category-chart">
                  <div className="budget-donut" />

                  <div className="budget-categories">
                    <span>
                      <i className="category-dot logement" />
                      Logement
                    </span>

                    <span>
                      <i className="category-dot transport" />
                      Transport
                    </span>

                    <span>
                      <i className="category-dot activities" />
                      Activités
                    </span>

                    <span>
                      <i className="category-dot others" />
                      Autres
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* =================================================
              REMBOURSEMENTS
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <CircleDollarSign />
            </div>

            <h3>Remboursements</h3>

            <p>
              Sachez immédiatement qui doit quoi et simplifiez les
              remboursements.
            </p>

            <div className="feature-demo reimbursement-demo">
              <div className="reimbursement-row">
                <img
                  src="avatar2.png"
                  alt="Anthony"
                  className="reimbursement-avatar"
                />

                <span className="reimbursement-text">Anthony doit à Cindy</span>

                <strong className="amount-positive">+42,50 €</strong>
              </div>

              <div className="reimbursement-row">
                <img
                  src="avatar1.png"
                  alt="Cindy"
                  className="reimbursement-avatar"
                />

                <span className="reimbursement-text">Cindy doit à Marie</span>

                <strong className="amount-negative">-18,20 €</strong>
              </div>

              <div className="reimbursement-row">
                <img
                  src="avatar4.png"
                  alt="Thomas"
                  className="reimbursement-avatar"
                />

                <span className="reimbursement-text">
                  Thomas doit à Anthony
                </span>

                <strong className="amount-positive">+60,70 €</strong>
              </div>
            </div>
          </article>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <Bell />
            </div>

            <h3>Notifications</h3>

            <p>Ne manquez aucune activité importante du voyage.</p>

            <div className="feature-demo notifications-demo">
              <div className="notification-demo-row">
                <span className="notification-demo-icon">
                  <WalletCards size={20} />
                </span>

                <div>
                  <strong>Anthony a ajouté une dépense</strong>
                  <span>Il y a 2 min</span>
                </div>
              </div>

              <div className="notification-demo-row">
                <span className="notification-demo-icon destination">
                  <MapPin size={20} />
                </span>

                <div>
                  <strong>Marie a proposé une destination</strong>
                  <span>Il y a 1 h</span>
                </div>
              </div>

              <div className="notification-demo-row">
                <span className="notification-demo-icon repayment">
                  <CircleDollarSign size={20} />
                </span>

                <div>
                  <strong>Thomas a confirmé un remboursement</strong>
                  <span>Il y a 3 h</span>
                </div>
              </div>
            </div>
          </article>

          {/* =================================================
              RÉCAPITULATIF
          ================================================== */}

          <article className="feature-card">
            <div className="feature-icon">
              <FileText />
            </div>

            <h3>Récapitulatif</h3>

            <p>
              Retrouvez toutes les dépenses et exportez le budget en un clic.
            </p>

            <div className="feature-demo recap-demo">
              <div className="recap-trip-title">
                <strong>Road trip Portugal</strong>
                <img
                  src="portugal.png"
                  alt="Drapeau du Portugal"
                  className="recap-country-flag"
                />
              </div>
              <span>17 – 22 août 2026</span>

              <span>👥 5 participants</span>

              <button type="button">
                <FileText size={16} />
                Exporter en PDF
              </button>
            </div>
          </article>
        </div>
      </section>
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

          <article className="premium-feature-card">
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
          </article>

          {/* =================================================
              CHECKLIST
          ================================================== */}

          <article className="premium-feature-card">
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
          </article>

          {/* =================================================
              BUDGET PRÉVISIONNEL
          ================================================== */}

          <article className="premium-feature-card">
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
          </article>

          {/* =================================================
              EXPORT
          ================================================== */}

          <article className="premium-feature-card">
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
          </article>
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
            Commencez gratuitement et passez au Premium uniquement si vous
            souhaitezz aller plus loin dans la préparation de votre voyage.
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
              BIENTÔT DISPONIBLE
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

            <button type="button" className="pricing-premium-btn" disabled>
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
    </main>
  );
}

export default HomePage;
