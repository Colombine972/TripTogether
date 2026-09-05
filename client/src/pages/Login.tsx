import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEventHandler } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";

import "./styles/Auth.css";

import { useAuth } from "../contexts/AuthContext";

function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { setAuth } = useAuth();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     REDIRECTION SÉCURISÉE
  ========================================================= */

  const safeRedirect =
    redirect?.startsWith("/") &&
    !redirect.startsWith("//")
      ? redirect
      : "/";

  /* =========================================================
     LIEN VERS REGISTER
     CONSERVATION DU REDIRECT SI PRÉSENT
  ========================================================= */

  const registerPath =
    safeRedirect !== "/"
      ? `/register?redirect=${encodeURIComponent(
          safeRedirect,
        )}`
      : "/register";

  /* =========================================================
     CONNEXION
  ========================================================= */

  const handleSubmit: FormEventHandler<
    HTMLFormElement
  > = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: emailRef.current?.value,
            password: passwordRef.current?.value,
          }),
        },
      );

      /* =====================================================
         CONNEXION RÉUSSIE
      ====================================================== */

      if (response.status === 200) {
        const data = await response.json();

        setAuth(data);

        localStorage.setItem(
          "token",
          data.token,
        );

        localStorage.setItem(
          "auth",
          JSON.stringify(data),
        );

        navigate(safeRedirect, {
          replace: true,
        });

        window.scrollTo({
          top: 0,
        });

        return;
      }

      /* =====================================================
         IDENTIFIANTS INCORRECTS
      ====================================================== */

      if (response.status === 401) {
        setError(
          "Email ou mot de passe incorrect",
        );

        return;
      }

      /* =====================================================
         COMPTE INTROUVABLE
      ====================================================== */

      if (response.status === 403) {
        setError(
          "Aucun compte associé à cet email",
        );

        return;
      }

      /* =====================================================
         AUTRE ERREUR
      ====================================================== */

      setError(
        "Une erreur est survenue. Veuillez réessayer.",
      );
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de se connecter au serveur",
      );
    }
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <div className="auth-page auth-page-login">
      <div className="auth-card auth-card-login">
        <div className="logo-container">
          <div className="logo-icon">
            🧳
          </div>

          <h1 className="logo-text">
            Trip Together
          </h1>
        </div>

        <h2 className="title">
          Bon retour parmi nous
        </h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="input-group">
            <input
              ref={emailRef}
              type="email"
              id="email"
              className="form-input"
              placeholder="Email"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group password-input-group">
            <input
              ref={passwordRef}
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              id="password"
              className="form-input password-input"
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (previous) =>
                    !previous,
                )
              }
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              title={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOff size={21} />
              ) : (
                <Eye size={21} />
              )}
            </button>
          </div>

          <div className="forgot-password-container">
            <Link
              to="/forgot-password"
              className="forgot-password-link"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            className="submit-btn"
          >
            SE CONNECTER
          </button>
        </form>

        <div className="footer-login">
          Pas encore membre ?{" "}

          <Link
            to={registerPath}
            onClick={() =>
              window.scrollTo({
                top: 0,
              })
            }
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;