import React from "react";
import { Link } from "react-router-dom";
import "../Home.css";

function Home() {
  return (
    <div className="home-page">
      <nav className="home-nav">
        <Link to="/" className="home-logo">
          <span className="logo-icon">✈</span>
          <span>sky<span className="logo-blue">route</span></span>
        </Link>

        <div className="nav-right">
          <span className="nav-tagline">Your journey starts here.</span>
          <Link to="/login" className="nav-login">
            Login
          </Link>
          <Link to="/register" className="nav-signup">
            Create an account
          </Link>
        </div>
      </nav>

      <main className="home-hero">
        <div className="hero-left">
          <div className="hero-label">
            <span className="live-dot"></span>
            YOUR NEXT DESTINATION AWAITS
          </div>

          <h1>
            The world is
            <br />
            <span>closer</span> than
            <br />
            you think.
          </h1>

          <p className="hero-description">
            Discover new destinations, explore flight options,
            and make every journey count. Your next adventure
            begins with SkyRoute.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="hero-primary">
              Create an account <span>↗</span>
            </Link>

            <Link to="/login" className="hero-secondary">
              Login <span>→</span>
            </Link>
          </div>

          <div className="hero-trust">
            <div className="trust-icon">✦</div>
            <div>
              <strong>Your journey, your way.</strong>
              <p>Explore. Choose. Fly.</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="globe">
            <div className="globe-line globe-line-one"></div>
            <div className="globe-line globe-line-two"></div>
            <div className="globe-line globe-line-three"></div>
            <div className="globe-equator"></div>

            <span className="city-dot city-kolkata"></span>
            <span className="city-dot city-london"></span>
            <span className="city-dot city-dubai"></span>

            <svg
              className="flight-path"
              viewBox="0 0 440 300"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M55 220 Q 160 35 265 115 T 375 65"
                stroke="#70C5FF"
                strokeWidth="2"
                strokeDasharray="5 8"
              />
              <circle cx="55" cy="220" r="5" fill="#FFFFFF" />
              <circle cx="375" cy="65" r="5" fill="#70C5FF" />
            </svg>

            <div className="plane-symbol">✈</div>
          </div>

          <div className="destination-card destination-top">
            <span className="destination-icon">⌁</span>
            <div>
              <span className="destination-small">EXPLORE THE WORLD</span>
              <strong>One journey at a time.</strong>
            </div>
          </div>

          <div className="destination-card destination-bottom">
            <div className="destination-pin">✦</div>
            <div>
              <span className="destination-small">YOUR NEXT ADVENTURE</span>
              <strong>Starts with SkyRoute.</strong>
            </div>
            <span className="destination-arrow">↗</span>
          </div>

          <div className="hero-number">01 <span>/ YOUR JOURNEY</span></div>
        </div>
      </main>

      <footer className="home-footer">
        <span>SKYROUTE © 2026</span>
        <span>MADE FOR THE LOVE OF TRAVEL</span>
        <span>YOUR WORLD. YOUR ROUTE.</span>
      </footer>
    </div>
  );
}

export default Home;