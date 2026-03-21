import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../pages/styles/Account.css";

export default function Account() {
  const { auth, setAuth } = useAuth();

  const [user, setUser] = useState({
    firstname: auth?.user?.firstname || "",
    lastname: auth?.user?.lastname || "",
    email: auth?.user?.email || "",
  });

  const [originalUser, setOriginalUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);

  // passer en mode édition
  const handleEdit = () => {
    setOriginalUser(user);
    setIsEditing(true);
  };

  // annuler les modifications
  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
  };

  // sauvegarder
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || auth?.token;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // 🔥 ICI : mise à jour du AuthContext
      if (!auth) return;
      setAuth({
        token: auth.token,
        user: {
          ...auth.user,
          ...user,
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="account-page">
      <h1>Mon compte</h1>

      <div className="account-card">
        <h2>Informations personnelles</h2>

        {isEditing ? (
          <>
            <div className="form-group">
              <label htmlFor="firstname">Prénom</label>
              <input
                value={user.firstname}
                onChange={(e) =>
                  setUser({ ...user, firstname: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Nom</label>
              <input
                value={user.lastname}
                onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="account-buttons">
              <button type="button" onClick={handleSave} className="save-btn">
                Sauvegarder
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
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
