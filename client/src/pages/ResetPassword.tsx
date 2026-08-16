import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FormEventHandler } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import "./styles/Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Le lien de réinitialisation est invalide.");

      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");

      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Impossible de modifier le mot de passe.");

        return;
      }

      navigate("/login", {
        state: {
          toast: {
            type: "success",
            message: "Votre mot de passe a été modifié avec succès.",
          },
        },
      });
    } catch (err) {
      console.error(err);

      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page auth-page-reset-password">
        <div className="auth-card auth-card-reset-password">
          <div className="logo-container">
            <div className="logo-icon">🧳</div>

            <h1 className="logo-text">Trip Together</h1>
          </div>

          <h2 className="title">Lien invalide</h2>

          <div className="error-message">
            Ce lien de réinitialisation est invalide.
          </div>

          <div className="footer-login">
            <Link to="/forgot-password">Demander un nouveau lien</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-page-reset-password">
      <div className="auth-card auth-card-reset-password">
        <div className="logo-container">
          <div className="logo-icon">🧳</div>

          <h1 className="logo-text">Trip Together</h1>
        </div>

        <h2 className="title">Nouveau mot de passe</h2>

        <p className="auth-description">
          Choisissez un nouveau mot de passe contenant au moins 8 caractères.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="new-password"
              className="form-input password-input"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          </div>

          <div className="input-group password-input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-new-password"
              className="form-input password-input"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              aria-label={
                showConfirmPassword
                  ? "Masquer la confirmation"
                  : "Afficher la confirmation"
              }
            >
              {showConfirmPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              isLoading || password.length < 8 || password !== confirmPassword
            }
          >
            {isLoading ? "MODIFICATION..." : "MODIFIER MON MOT DE PASSE"}
          </button>
        </form>

        <div className="footer-login">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
