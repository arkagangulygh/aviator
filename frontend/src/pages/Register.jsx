
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://flightfinder-d0ze.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      navigate("/login", {
        state: { message: "Account created successfully! Please log in." },
      });
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
          <span className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span>
          <h1>The world is closer than you think.</h1>
          <p>
            Discover new destinations, compare flights, and make every
            journey count.
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
            <span className="eyebrow">JOIN SKYROUTE</span>
            <h2>Create your account</h2>
            <p>Sign up to make your next trip a little easier.</p>
          </div>

          <form onSubmit={handleRegister}>
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            {error && <p className="form-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <p className="auth-legal">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
