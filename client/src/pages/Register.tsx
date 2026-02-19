import { useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { useNavigate } from "react-router";
import "./styles/Auth.css";

function Register() {
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
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
    <div className="auth auth-page">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-icon">🧳</span> {/* Placeholder icon */}
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
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Mot de passe"
              required
            />
            {password.length >= 8 && (
              <span className="validation-icon">✅</span>
            )}
          </div>
          <div className="input-group">
            <input
              type="password"
              id="confirm-password"
              className="form-input"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Répéter le mot de passe"
              required
            />
            {password === confirmPassword && password !== "" && (
              <span className="validation-icon">✅</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={password !== confirmPassword || password.length < 8}
          >
            Créer mon compte
          </button>
        </form>
        <div className="footer-login">
          Déjà membre ?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
