import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router";
import Modal from "./Modal";
import "../pages/styles/PremiumComingSoonModal.css";

type PremiumComingSoonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
};

const premiumFeatureDescriptions: Record<string, string> = {
  "Suggestions intelligentes":
    "Découvrez des idées de destinations et d'activités adaptées à votre groupe pour vous aider à préparer votre voyage plus facilement.",

  "Checklist collaborative":
    "Préparez votre voyage à plusieurs grâce à une checklist partagée : réservations, passeports, assurance, valises et autres préparatifs.",

  "Budget prévisionnel":
    "Estimez vos dépenses avant le départ, répartissez votre budget par catégorie et gardez une vision claire du coût prévisionnel de votre voyage.",

  "Export du voyage":
    "Regroupez les informations essentielles de votre voyage dans un document complet, pratique à consulter et à partager avec votre groupe.",

  "TripTogether Premium":
    "Profitez bientôt de nouveaux outils pour préparer votre voyage plus facilement : budget prévisionnel, checklist collaborative, planning, informations pratiques et export.",
};

function PremiumComingSoonModal({
  isOpen,
  onClose,
  featureName,
}: PremiumComingSoonModalProps) {
  const description =
    premiumFeatureDescriptions[featureName ?? ""] ??
    "De nouvelles fonctionnalités arrivent bientôt pour vous aider à préparer vos voyages encore plus facilement.";

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

        <p className="premium-coming-soon-intro">{description}</p>

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
