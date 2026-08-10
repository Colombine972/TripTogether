import {
  Bell,
  CircleDollarSign,
  FileText,
  MapPin,
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

              <div className="fake-chart">
                <span className="chart-line chart-line-1" />
                <span className="chart-line chart-line-2" />
                <span className="chart-line chart-line-3" />
                <span className="chart-line chart-line-4" />
                <span className="chart-line chart-line-5" />
                <span className="chart-line chart-line-6" />
              </div>

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
                <span className="small-avatar">A</span>

                <span>Anthony doit à Cindy</span>

                <strong className="amount-positive">+42,50 €</strong>
              </div>

              <div className="reimbursement-row">
                <span className="small-avatar">C</span>

                <span>Cindy doit à Marie</span>

                <strong className="amount-negative">-18,20 €</strong>
              </div>

              <div className="reimbursement-row">
                <span className="small-avatar">T</span>

                <span>Thomas doit à Anthony</span>

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
                  <WalletCards size={14} />
                </span>

                <div>
                  <strong>Anthony a ajouté une dépense</strong>
                  <span>Il y a 2 min</span>
                </div>
              </div>

              <div className="notification-demo-row">
                <span className="notification-demo-icon destination">
                  <MapPin size={14} />
                </span>

                <div>
                  <strong>Marie a proposé une destination</strong>
                  <span>Il y a 1 h</span>
                </div>
              </div>

              <div className="notification-demo-row">
                <span className="notification-demo-icon repayment">
                  <CircleDollarSign size={14} />
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
              <strong>Road trip Portugal 🇵🇹</strong>

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
    </main>
  );
}

export default HomePage;
