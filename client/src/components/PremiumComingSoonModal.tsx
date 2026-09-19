import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router";
import Modal from "./Modal";
import "../pages/styles/PremiumComingSoonModal.css";

type PremiumComingSoonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
};

function PremiumComingSoonModal({
  isOpen,
  onClose,
  featureName,
}: PremiumComingSoonModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="premium-coming-soon-modal">
        <div className="premium-coming-soon-icon">
          <Crown size={30} />
        </div>

        <span className="premium-coming-soon-badge">
          <Sparkles size={14} />
          PREMIUM
        </span>

        <h2>
          {featureName
            ? `${featureName} arrive bientôt`
            : "TripTogether Premium arrive bientôt"}
        </h2>

        <p className="premium-coming-soon-intro">
          Préparez encore mieux vos voyages avec les prochaines fonctionnalités
          Premium.
        </p>

        <div className="premium-coming-soon-features">
          <span>Budget prévisionnel</span>
          <span>Checklist collaborative</span>
          <span>Planning détaillé</span>
          <span>Informations pratiques</span>
          <span>Export du voyage</span>
        </div>

        <p className="premium-coming-soon-message">
          En attendant, profitez de TripTogether gratuitement pour organiser
          votre voyage avec vos proches.
        </p>

        <div className="premium-coming-soon-actions">
          <Link
            to="/create-trip"
            className="premium-coming-soon-primary"
            onClick={onClose}
          >
            Créer mon voyage gratuitement
          </Link>

          <button
            type="button"
            className="premium-coming-soon-secondary"
            onClick={onClose}
          >
            Continuer avec la version gratuite
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PremiumComingSoonModal;
