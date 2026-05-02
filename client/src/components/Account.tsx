import { Download } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import PreferencesCard from "./PreferencesCard";
import SecurityCard from "./SecurityCard";
import "../pages/styles/Account.css";
import type { UserType } from "../types/userType";
import DeleteAccountCard from "./DeleteAccountCard";

export default function Account() {
  const { auth, setAuth } = useAuth();

  const [user, setUser] = useState<Partial<UserType>>({
    firstname: auth?.user?.firstname || "",
    lastname: auth?.user?.lastname || "",
    email: auth?.user?.email || "",
    avatar_url: auth?.user?.avatar_url || "",
  });

  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});

  const [preview, setPreview] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleOpenProfileModal = () => {
    setEditedUser({ ...user });
    setPreview(user.avatar_url || "");
    setShowProfileModal(true);
  };

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
          body: JSON.stringify(editedUser),
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      const updatedUser = { ...user, ...data };

      setUser(updatedUser);

      setAuth({
        token: auth.token,
        user: { ...auth.user, ...data },
      });

      setShowProfileModal(false);
      setPreview("");

      toast.success("Profil mis à jour ✅");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour le profil");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);

      setEditedUser((prev) => ({
        ...prev,
        avatar_url: base64,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me/export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de télécharger vos données.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `triptogether-my-data-${new Date().toISOString().split("T")[0]}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors du téléchargement des données.");
    }
  };

  return (
    <div className="account-page">
      <div className="account-cards">
        <div className="account-card">
          <h2>Informations personnelles</h2>

          <div className="card-content">
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

              <div className="account-user-actions">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={handleOpenProfileModal}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="edit-btn-save"
                  onClick={handleDownloadData}
                >
                  <Download size={18} />
                  Télécharger mes données
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="account-card security-card">
          <h2>Sécurité</h2>
          <div className="card-content">
          <SecurityCard />
        </div>
        </div>

        <div className="account-card preference-card">
          <h2>Mes Préférences</h2>
          <PreferencesCard />
        </div>

        <div className="account-card delete-account-card">
          <h2>Suppression du compte</h2>
          <div className="card-content">
          <DeleteAccountCard />
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
                value={editedUser.firstname || ""}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, firstname: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Nom</label>
              <input
                id="lastname"
                value={editedUser.lastname || ""}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, lastname: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={editedUser.email || ""}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, email: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-role"
                onClick={() => setShowProfileModal(false)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
