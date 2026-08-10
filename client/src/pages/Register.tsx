import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import "./styles/Auth.css";

function Register() {
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: firstnameRef.current?.value,
            lastname: lastnameRef.current?.value,
            email: emailRef.current?.value,
            password,
          }),
        },
      );

      if (response.status === 201) {
        navigate("/login", {
          state: {
            toast: {
              type: "success",
              message: "Inscription réussie",
            },
          },
        });
      } else {
        console.info(response);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card auth-card-register">

        <div className="logo-container">
          <div className="logo-icon">🧳</div>

          <h1 className="logo-text">Trip Together</h1>
        </div>


        <h2 className="title">Planifiez votre prochaine aventure</h2>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="input-group">
            <input
              ref={lastnameRef}
              type="text"
              id="lastname"
              className="form-input"
              placeholder="Nom"
              autoComplete="family-name"
              required
            />
          </div>

          <div className="input-group">
            <input
              ref={firstnameRef}
              type="text"
              id="firstname"
              className="form-input"
              placeholder="Prénom"
              autoComplete="given-name"
              required
            />
          </div>

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
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-input password-input"
              placeholder="Mot de passe"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
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
              title={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>

            {password.length >= 8 && (
              <span
                className="validation-icon password-validation-icon"
                aria-label="Mot de passe valide"
              >
                ✅
              </span>
            )}
          </div>

          <div className="input-group password-input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="form-input password-input"
              placeholder="Répéter le mot de passe"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
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
                <EyeOff size={21} />
              ) : (
                <Eye size={21} />
              )}
            </button>

            {password === confirmPassword && password !== "" && (
              <span
                className="validation-icon password-validation-icon"
                aria-label="Les mots de passe correspondent"
              >
                ✅
              </span>
            )}
          </div>


          <div className="checkbox-group">
            <label className="checkbox-label" htmlFor="privacy">
              <input
                type="checkbox"
                id="privacy"
                required
                checked={privacyAccepted}
                onChange={(event) =>
                  setPrivacyAccepted(event.target.checked)
                }
              />

              <span>
                J’ai lu et j’accepte la{" "}
                <Link to="/privacy-policy">
                  politique de confidentialité
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              password !== confirmPassword ||
              password.length < 8 ||
              !privacyAccepted
            }
          >
            Créer mon compte
          </button>
        </form>

        <div className="footer-login">
          Déjà membre ?{" "}
          <Link to="/login" onClick={() => window.scrollTo({ top: 0 })}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;