import { useRef, useState } from "react";
import type { FormEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import "./styles/Auth.css";

import { useAuth } from "../contexts/AuthContext";

function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailRef.current?.value,
            password: passwordRef.current?.value,
          }),
        },
      );

      if (response.status === 200) {
        const data = await response.json();
        setAuth(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("auth", JSON.stringify(data));
        navigate("/", { replace: true });
        window.scrollTo({ top: 0 });
      } else if (response.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else if (response.status === 403) {
        setError("Aucun compte associé à cet email");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur");
    }
  };

  return (
    <div className="auth auth-page">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-icon">🧳</span>
          <h1 className="logo-text">Trip Together</h1>
        </div>
        <h2 className="title">Bon retour parmi nous</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
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
              ref={passwordRef}
              type="password"
              id="password"
              className="form-input"
              placeholder="Mot de passe"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            SE CONNECTER
          </button>
        </form>
        <div className="footer-login">
          Pas encore membre ?
          <Link to="/register" onClick={() => window.scrollTo({ top: 0 })}>
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
