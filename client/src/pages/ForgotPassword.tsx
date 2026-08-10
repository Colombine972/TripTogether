import { useState } from "react";
import type { FormEventHandler } from "react";
import { Link } from "react-router";

import "./styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Impossible d'effectuer cette demande.",
        );

        return;
      }

      setMessage(data.message);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de contacter le serveur. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-forgot-password">
      <div className="auth-card auth-card-forgot-password">
        <div className="logo-container">
          <div className="logo-icon">🧳</div>

          <h1 className="logo-text">Trip Together</h1>
        </div>

        <h2 className="title">Mot de passe oublié ?</h2>

        <p className="auth-description">
          Saisissez l'adresse e-mail associée à votre compte.
          Nous vous enverrons un lien permettant de choisir
          un nouveau mot de passe.
        </p>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!message && (
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="input-group">
              <input
                type="email"
                id="forgot-password-email"
                className="form-input"
                placeholder="Email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "ENVOI..."
                : "ENVOYER LE LIEN"}
            </button>
          </form>
        )}

        <div className="footer-login">
          <Link to="/login">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;