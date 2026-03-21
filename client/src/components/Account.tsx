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

  const [originalUser, setOriginalUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState("");

  //  EDIT MODE
  const handleEdit = () => {
    setOriginalUser(user);
    setIsEditing(true);
  };

  //  CANCEL
  const handleCancel = () => {
    setUser(originalUser);
    setPreview("");
    setIsEditing(false);
  };

  // SAVE 
  const handleSave = async () => {
    try {
      if (!auth) return;

      const token = localStorage.getItem("token") || auth.token;

      const updatedUser = {
        ...user,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        },
      );

      const data = await response.json(); // 🔥 TRÈS IMPORTANT

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      //  UPDATE GLOBAL (NAVBAR)
      setAuth({
        token: auth.token,
        user: {
          ...auth.user,
          ...data,
        },
      });

      setPreview("");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  //  IMAGE PREVIEW
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);

      //  on stocke directement dans user
      setUser((prev) => ({
        ...prev,
        avatar_url: base64,
      }));
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="account-page">
      <h1>Mon compte</h1>

      <div className="account-card">
        <h2>Informations personnelles</h2>

        {/* AVATAR */}
        <div className="avatar-container">
          <img
            src={preview || user.avatar_url || "/images/default-avatar.png"}
            alt="avatar"
            className="avatar"
          />
        </div>

        {isEditing ? (
          <>
            {/* IMAGE INPUT */}
            <div className="form-group">
              <label htmlFor="avatar">Photo de profil</label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
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
                onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="account-buttons">
              <button type="button" onClick={handleSave} className="save-btn">
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              {user.firstname} {user.lastname}
            </p>
            <p>{user.email}</p>

            <button type="button" onClick={handleEdit} className="edit-btn">
              Modifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}
