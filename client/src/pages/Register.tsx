import { Eye, EyeOff } from "lucide-react";
import {
  useRef,
  useState,
} from "react";
import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";

import "./styles/Auth.css";

function Register() {
  const firstnameRef =
    useRef<HTMLInputElement>(null);

  const lastnameRef =
    useRef<HTMLInputElement>(null);

  const emailRef =
    useRef<HTMLInputElement>(null);

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const { setAuth } =
    useAuth();

  const redirect =
    searchParams.get("redirect");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    privacyAccepted,
    setPrivacyAccepted,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     REDIRECTION SÉCURISÉE
  ========================================================= */

  const safeRedirect =
    redirect?.startsWith("/") &&
    !redirect.startsWith("//")
      ? redirect
      : "/";

  /* =========================================================
     LIEN VERS LOGIN
     CONSERVATION DU REDIRECT
  ========================================================= */

  const loginPath =
    safeRedirect !== "/"
      ? `/login?redirect=${encodeURIComponent(
          safeRedirect,
        )}`
      : "/login";

  /* =========================================================
     MOT DE PASSE
  ========================================================= */

  const handlePasswordChange: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setPassword(
      event.target.value,
    );
  };

  const handleConfirmPasswordChange: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setConfirmPassword(
      event.target.value,
    );
  };

  /* =========================================================
     CONNEXION AUTOMATIQUE
     APRÈS INSCRIPTION
  ========================================================= */

  const loginAutomatically =
    async (
      email: string,
      userPassword: string,
    ) => {
      const response =
        await fetch(
          `${
            import.meta.env
              .VITE_API_URL
          }/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password:
                userPassword,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Connexion automatique impossible",
        );
      }

      const data =
        await response.json();

      /*
       * Même fonctionnement
       * que Login.tsx.
       */

      setAuth(data);

      localStorage.setItem(
        "token",
        data.token,
      );

      localStorage.setItem(
        "auth",
        JSON.stringify(data),
      );

      return data;
    };

  /* =========================================================
     INSCRIPTION
  ========================================================= */

  const handleSubmit: FormEventHandler<
    HTMLFormElement
  > = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    const firstname =
      firstnameRef.current
        ?.value.trim() ?? "";

    const lastname =
      lastnameRef.current
        ?.value.trim() ?? "";

    const email =
      emailRef.current
        ?.value.trim()
        .toLowerCase() ?? "";

    /* =====================================================
       VÉRIFICATIONS FRONT
    ====================================================== */

    if (
      !firstname ||
      !lastname ||
      !email
    ) {
      setError(
        "Veuillez renseigner tous les champs.",
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );

      return;
    }

    if (!privacyAccepted) {
      setError(
        "Vous devez accepter la politique de confidentialité.",
      );

      return;
    }

    try {
      setSubmitting(true);

      /* ===================================================
         CRÉATION DU COMPTE
      =================================================== */

      const response =
        await fetch(
          `${
            import.meta.env
              .VITE_API_URL
          }/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              firstname,
              lastname,
              email,
              password,
            }),
          },
        );

      /* ===================================================
         INSCRIPTION RÉUSSIE
      =================================================== */

      if (
        response.status === 201
      ) {
        /*
         * On ne redirige PLUS
         * vers Login.
         *
         * On connecte immédiatement
         * l'utilisateur.
         */

        await loginAutomatically(
          email,
          password,
        );

        toast.success(
          "Votre compte a été créé avec succès.",
        );

        /*
         * Si l'utilisateur venait
         * d'une invitation :
         *
         * /register?redirect=/invitation/xxx
         *
         * il revient directement
         * sur cette invitation.
         */

        navigate(
          safeRedirect,
          {
            replace: true,
          },
        );

        window.scrollTo({
          top: 0,
        });

        return;
      }

      /* ===================================================
         EMAIL DÉJÀ UTILISÉ
      =================================================== */

      if (
        response.status === 409
      ) {
        setError(
          "Un compte existe déjà avec cette adresse e-mail.",
        );

        return;
      }

      /* ===================================================
         DONNÉES INVALIDES
      =================================================== */

      if (
        response.status === 400
      ) {
        const data =
          await response
            .json()
            .catch(() => null);

        setError(
          data?.message ||
            data?.error ||
            "Les informations saisies sont invalides.",
        );

        return;
      }

      /* ===================================================
         AUTRE ERREUR
      =================================================== */

      setError(
        "Une erreur est survenue lors de la création du compte.",
      );
    } catch (err) {
      console.error(
        "Erreur inscription :",
        err,
      );

      setError(
        "Impossible de créer le compte. Veuillez réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card auth-card-register">
        <div className="logo-container">
          <div className="logo-icon">
            🧳
          </div>

          <h1 className="logo-text">
            Trip Together
          </h1>
        </div>

        <h2 className="title">
          Planifiez votre prochaine aventure
        </h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* NOM */}

          <div className="input-group">
            <input
              ref={
                lastnameRef
              }
              type="text"
              id="lastname"
              className="form-input"
              placeholder="Nom"
              autoComplete="family-name"
              required
            />
          </div>

          {/* PRÉNOM */}

          <div className="input-group">
            <input
              ref={
                firstnameRef
              }
              type="text"
              id="firstname"
              className="form-input"
              placeholder="Prénom"
              autoComplete="given-name"
              required
            />
          </div>

          {/* EMAIL */}

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

          {/* MOT DE PASSE */}

          <div className="input-group password-input-group">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              id="password"
              className="form-input password-input"
              placeholder="Mot de passe"
              value={
                password
              }
              onChange={
                handlePasswordChange
              }
              autoComplete="new-password"
              minLength={8}
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
                <EyeOff
                  size={21}
                />
              ) : (
                <Eye
                  size={21}
                />
              )}
            </button>

            {password.length >=
              8 && (
              <span
                className="validation-icon password-validation-icon"
                aria-label="Mot de passe valide"
              >
                ✅
              </span>
            )}
          </div>

          {/* CONFIRMATION */}

          <div className="input-group password-input-group">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              id="confirmPassword"
              className="form-input password-input"
              placeholder="Répéter le mot de passe"
              value={
                confirmPassword
              }
              onChange={
                handleConfirmPasswordChange
              }
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (previous) =>
                    !previous,
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Masquer la confirmation du mot de passe"
                  : "Afficher la confirmation du mot de passe"
              }
              title={
                showConfirmPassword
                  ? "Masquer la confirmation du mot de passe"
                  : "Afficher la confirmation du mot de passe"
              }
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={21}
                />
              ) : (
                <Eye
                  size={21}
                />
              )}
            </button>

            {password ===
                confirmPassword &&
              password !== "" && (
                <span
                  className="validation-icon password-validation-icon"
                  aria-label="Les mots de passe correspondent"
                >
                  ✅
                </span>
              )}
          </div>

          {/* CONFIDENTIALITÉ */}

          <div className="checkbox-group">
            <label
              className="checkbox-label"
              htmlFor="privacy"
            >
              <input
                type="checkbox"
                id="privacy"
                required
                checked={
                  privacyAccepted
                }
                onChange={(
                  event,
                ) =>
                  setPrivacyAccepted(
                    event
                      .target
                      .checked,
                  )
                }
              />

              <span>
                J’ai lu et
                j’accepte la{" "}

                <Link to="/privacy">
                  politique de
                  confidentialité
                </Link>
              </span>
            </label>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-btn"
            disabled={
              password !==
                confirmPassword ||
              password.length <
                8 ||
              !privacyAccepted ||
              submitting
            }
          >
            {submitting
              ? "Création du compte..."
              : "Créer mon compte"}
          </button>
        </form>

        <div className="footer-login">
          Déjà membre ?{" "}

          <Link
            to={loginPath}
            onClick={() =>
              window.scrollTo({
                top: 0,
              })
            }
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;