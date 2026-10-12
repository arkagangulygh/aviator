
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://flightfinder-d0ze.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      // Keep the JWT returned by FastAPI for authenticated requests.
      const token = data.access_token;

      if (!token) {
        throw new Error("Login succeeded, but the server returned no access token.");
      }

      localStorage.setItem("access_token", token);
      navigate("/flights");
    } catch (err) {
      setError(
        err.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/" className="brand">
          <span className="brand-icon">✈</span> SkyRoute
        </Link>

        <div className="visual-content">
          <span className="eyebrow">YOUR JOURNEY CONTINUES</span>
          <h1>Every great journey starts somewhere.</h1>
          <p>
            Sign in to explore flights, manage your bookings, and get ready
            for your next adventure.
          </p>
        </div>

        <div className="visual-footer">
          <span>✦ Your journey. Your way.</span>
          <span>FLY BEYOND ORDINARY</span>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <span className="brand-icon">✈</span> SkyRoute
          </div>

          <div className="form-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Log in to SkyRoute</h2>
            <p>Your next destination is just a few clicks away.</p>
          </div>

          {successMessage && (
            <p className="form-success">{successMessage}</p>
          )}

          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p className="form-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            New to SkyRoute? <Link to="/register">Create an account</Link>
          </p>

          <p className="auth-legal">
            Your journey matters to us. Travel with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
