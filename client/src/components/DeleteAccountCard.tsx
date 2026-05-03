import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";

type DeleteAccountCardProps = {
  onDeleted?: () => void;
};

export default function DeleteAccountCard({
  onDeleted,
}: DeleteAccountCardProps) {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const expectedConfirmation = "SUPPRIMER";

  const resetDeleteState = () => {
    setShowDeleteModal(false);
    setConfirmText("");
    setErrorMessage("");
    setIsSubmitting(false);
  };

  const handleOpenDeleteModal = () => {
    setConfirmText("");
    setErrorMessage("");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (isSubmitting) return;
    resetDeleteState();
  };

  const handleDeleteAccount = async () => {
    setErrorMessage("");

    if (confirmText.trim() !== expectedConfirmation) {
      setErrorMessage(
        `Veuillez saisir exactement "${expectedConfirmation}" pour confirmer la suppression.`,
      );
      return;
    }

    const token = auth?.token || localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Votre session a expiré. Veuillez vous reconnecter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: { message?: string; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Une erreur est survenue lors de la suppression du compte.",
        );
      }

      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      setAuth(null);

      resetDeleteState();

      if (onDeleted) {
        onDeleted();
      }

      navigate("/login", {
        replace: true,
        state: {
          toast: {
            type: "success",
            message:
              "Votre compte a été supprimé définitivement. Vos données personnelles ont été supprimées et les données nécessaires ont été conservées de manière anonymisée.",
          },
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer votre compte pour le moment.",
      );
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="delete-content" >
        <p className="delete-account-warning">
          En supprimant votre compte, vous perdez immédiatement l’accès à
          l’application. <br />Une nouvelle connexion ne sera plus possible, sauf en
          cas de création d’un nouveau compte.
        </p>

        <button
          type="button"
          className="delete-btn"
          onClick={handleOpenDeleteModal}
        >
          <Trash2 size={18} />
          Supprimer mon compte
        </button>
      </div>

        {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal delete-account-modal">
            <h4>Confirmer la suppression du compte</h4>

            <p className="delete-account-warning-text">
              La suppression de votre compte est définitive.<br />
              Après validation, vous n’aurez plus accès à votre espace et votre
              session sera immédiatement invalidée.
            </p>

            <div className="delete-account-info">
              <div className="delete-account-block">
                <p className="delete-account-subtitle">
                  Seront supprimés définitivement :
                </p>
                <ul>
                  <li>Votre prénom</li>
                  <li>Votre nom</li>
                  <li>Votre adresse e-mail</li>
                  <li>Votre mot de passe chiffré (hash)</li>
                  <li>Votre avatar</li>
                  <li>Vos préférences</li>
                  <li>Vos invitations associées</li>
                </ul>
              </div>

              <div className="delete-account-block">
                <p className="delete-account-subtitle">
                  Seront conservés de manière anonymisée :
                </p>
                <ul>
                  <li>Les voyages liés à d’autres utilisateurs</li>
                  <li>Les dépenses déjà enregistrées</li>
                  <li>Les montants et calculs partagés</li>
                  <li>Les participations nécessaires à la cohérence des données</li>
                </ul>
              </div>

              <p className="delete-account-note">
                Dans ces éléments, votre identité sera remplacée par{" "}
                <strong>« utilisateur supprimé »</strong>.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="deleteConfirm">
                Pour confirmer, saisissez <strong>{expectedConfirmation}</strong>
              </label>
              <input
                id="deleteConfirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Tapez ${expectedConfirmation}`}
                disabled={isSubmitting}
              />
            </div>

            {errorMessage && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-role"
                onClick={handleCloseDeleteModal}
                disabled={isSubmitting}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteAccount}
                disabled={
                  isSubmitting || confirmText.trim() !== expectedConfirmation
                }
              >
                {isSubmitting
                  ? "Suppression en cours..."
                  : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
