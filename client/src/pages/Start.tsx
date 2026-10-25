import { Coins, UsersRound, Vote } from "lucide-react";
import { Link } from "react-router";
import "./styles/Start.css";
import { useAuth } from "../contexts/AuthContext";

function Start() {
  const { auth } = useAuth();

  return (
    <div className="start-page">
      <section className="start-container">
        <div className="start-banner">
          <img
            src="/images/start-voyage.png"
            alt="Paysage de bord de mer pour préparer un voyage entre amis"
          />
        </div>
        <div className="start-hero">
          <h1>Transformez votre carnet en voyage partagé</h1>
          <p>
            Votre carnet est prêt ? Importez-le dans TripTogether et donnez vie
            à votre voyage avec vos proches.
          </p>
        </div>

        <div className="start-steps">
          <div className="start-step">
            <span className="start-step-number">1</span>
            <div>
              <h2>Créez votre compte</h2>
              <p>Ou connectez-vous si vous en avez déjà un.</p>
            </div>
          </div>

          <div className="start-step">
            <span className="start-step-number">2</span>
            <div>
              <h2>Importez votre carnet PDF</h2>
              <p>Sélectionnez le fichier rempli et enregistré.</p>
            </div>
          </div>

          <div className="start-step">
            <span className="start-step-number">3</span>
            <div>
              <h2>Vérifiez et créez votre voyage</h2>
              <p>Puis invitez vos proches à vous rejoindre.</p>
            </div>
          </div>
        </div>

        <div className="start-actions">
          {auth ? (
            <>
              <Link
                to="/start/import"
                className="start-button start-button-primary"
              >
                Importer mon carnet PDF
              </Link>

              <p>
                Vous êtes connecté à TripTogether. Importez votre carnet pour
                préparer votre voyage.
              </p>
            </>
          ) : (
            <>
              <Link
                to="/register?redirect=%2Fstart"
                className="start-button start-button-primary"
              >
                Créer mon compte
              </Link>

              <Link
                to="/login?redirect=%2Fstart"
                className="start-button start-button-secondary"
              >
                J'ai déjà un compte
              </Link>

              <p>Vous importerez votre PDF après votre connexion.</p>
            </>
          )}
        </div>

        <div className="start-benefits">
          <span>
            <UsersRound size={23} />
            Invitez vos proches
          </span>

          <span>
            <Vote size={23} />
            Votez ensemble
          </span>

          <span>
            <Coins size={23} />
            Partagez les dépenses
          </span>
        </div>

        <p className="start-signature">
          Organisez ensemble. Profitez ensemble.
        </p>
      </section>
    </div>
  );
}

export default Start;
