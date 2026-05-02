import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";
import { toast } from "react-toastify";

export default function Account() {
  const { setAuth } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    try {
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        toast.error("Tous les champs sont obligatoires");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
      }

      const token = localStorage.getItem("token");
      console.log("TOKEN :", token);

      if (!token) {
        toast.error("Utilisateur non authentifié");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur serveur");
      }

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Mot de passe modifié 🔐");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de modifier le mot de passe");
    }
  };

  return (
    <>
      <div className="security-content">
        <p className="security-description">
          Gérez la sécurité de votre compte. Modifiez votre mot de passe pour
          protéger vos informations personnelles et sécuriser l’accès à votre
          compte.
        </p>
        <button
          type="button"
          className="security-btn"
          onClick={() => setShowPasswordModal(true)}
        >
          Changer le mot de passe
        </button>

        <button
          type="button"
          className="logout-btn"
          onClick={() => setShowLogoutModal(true)}
        >
          Se déconnecter
        </button>
      </div>

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Changer le mot de passe</h4>

            <div className="form-group">
              <label htmlFor="currentPassword">Mot de passe actuel</label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-role"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleChangePassword}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Se déconnecter</h4>
            <p>Voulez-vous vraiment vous déconnecter ?</p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-role"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  localStorage.removeItem("token");
                  setAuth(null);
                  window.location.href = "/login";
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
