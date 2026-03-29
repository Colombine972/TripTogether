import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";
import type { UserType } from "../types/userType";

export default function Account() {
  const { auth, setAuth } = useAuth();

  const [user, setUser] = useState<Partial<UserType>>({
    firstname: auth?.user?.firstname || "",
    lastname: auth?.user?.lastname || "",
    email: auth?.user?.email || "",
    avatar_url: auth?.user?.avatar_url || "",
  });

  const [preview, setPreview] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    try {
      if (!auth) return;

      const token = localStorage.getItem("token") || auth.token;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setAuth({
        token: auth.token,
        user: { ...auth.user, ...data },
      });

      setShowProfileModal(false);
      setPreview("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);

      setUser((prev) => ({
        ...prev,
        avatar_url: base64,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      alert("Mot de passe modifié avec succès");

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="account-page">

      <div className="account-cards">
        <div className="account-card">
          <h2>Informations personnelles</h2>

          <div className="account-display">
            <div className="account-avatar">
              <img
                src={preview || user.avatar_url || "/images/default-avatar.png"}
                alt="avatar"
              />
            </div>

            <div className="account-info">
              <h3>
                {user.firstname} {user.lastname}
              </h3>
              <p>{user.email}</p>

              <button type="button"
                className="edit-btn"
                onClick={() => setShowProfileModal(true)}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="account-card security-card">
          <h2>Sécurité</h2>

          <div className="security-content">
            <button type="button"
              className="security-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Changer le mot de passe
            </button>

            <button type="button"
              className="logout-btn"
              onClick={() => setShowLogoutModal(true)}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Modifier mes informations</h4>

            <div className="form-group">
              <label htmlFor="avatar">Photo</label>
              <input id="avatar" type="file" onChange={handleFileChange} />
            </div>

            <div className="form-group">
              <label htmlFor="firstname">Prénom</label>
              <input
                id="firstname"
                value={user.firstname}
                onChange={(e) =>
                  setUser({ ...user, firstname: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Nom</label>
              <input
                id="lastname"
                value={user.lastname}
                onChange={(e) =>
                  setUser({ ...user, lastname: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button type="button"
                className="btn-role"
                onClick={() => setShowProfileModal(false)}
              >
                Annuler
              </button>

              <button type="button" className="btn-primary" onClick={handleSave}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

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
              <label htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>
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
              <button type="button"
                className="btn-role"
                onClick={() => setShowPasswordModal(false)}
              >
                Annuler
              </button>

              <button type="button" className="btn-primary" onClick={handleChangePassword}>
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
              <button type="button"
                className="btn-role"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>

              <button type="button"
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
    </div>
  );
}