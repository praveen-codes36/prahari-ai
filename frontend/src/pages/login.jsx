import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | If already logged in
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("prahari_logged_in") === "true";

    if (loggedIn) {
      navigate("/citizen/home", {
        replace: true,
      });
    }
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    /*
     * Demo authentication.
     *
     * Later replace this section with your backend API.
     */

    setTimeout(() => {
      localStorage.setItem(
        "prahari_logged_in",
        "true"
      );

      localStorage.setItem(
        "prahari_user_email",
        email.trim()
      );

      if (rememberMe) {
        localStorage.setItem(
          "prahari_remember_me",
          "true"
        );
      } else {
        localStorage.removeItem(
          "prahari_remember_me"
        );
      }

      navigate("/citizen/home", {
        replace: true,
      });

      setLoading(false);
    }, 900);
  };

  return (
    <main className="login-page">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="login-background">

        <div className="login-grid"></div>

        <div className="login-glow login-glow-one"></div>

        <div className="login-glow login-glow-two"></div>

        <div className="login-glow login-glow-three"></div>

        {/* Decorative road lines */}

        <div className="road-line road-line-one"></div>

        <div className="road-line road-line-two"></div>

        <div className="road-line road-line-three"></div>

      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="login-header">

        <div className="login-brand">

          <div className="login-logo">

            <ShieldCheck size={27} />

          </div>

          <div className="login-brand-copy">

            <strong>PRAHARI</strong>

            <span>
              AI ROAD SAFETY NETWORK
            </span>

          </div>

        </div>

        <div className="login-network">

          <span className="network-dot"></span>

          NETWORK

          <strong>OPERATIONAL</strong>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="login-layout">

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <div className="login-hero">

          <div className="hero-badge">

            <span></span>

            AI-POWERED ROAD SAFETY NETWORK

          </div>

          <h1>

            Make every

            <span>
              journey safer.
            </span>

          </h1>

          <p className="hero-description">

            Prahari connects citizens, artificial
            intelligence, authorities and emergency
            responders into one intelligent road-safety
            ecosystem.

          </p>

          {/* =================================================
              LIVE INTELLIGENCE PANEL
          ================================================== */}

          <div className="intelligence-card">

            <div className="intelligence-header">

              <div>

                <Radio size={17} />

                <span>
                  LIVE ROAD INTELLIGENCE
                </span>

              </div>

              <div className="live-indicator">

                <span></span>

                LIVE

              </div>

            </div>

            <div className="intelligence-map">

              <div className="map-lines">

                <span className="map-line map-line-a"></span>

                <span className="map-line map-line-b"></span>

                <span className="map-line map-line-c"></span>

                <span className="map-line map-line-d"></span>

              </div>

              <div className="route-line route-blue"></div>

              <div className="route-line route-green"></div>

              <div className="map-point point-one"></div>

              <div className="map-point point-two"></div>

              <div className="map-point point-three"></div>

              <div className="map-point point-four"></div>

              <div className="map-point point-five"></div>

              <div className="map-location">

                <Navigation size={20} />

              </div>

              <div className="map-floating risk-box">

                <AlertTriangle size={15} />

                <div>

                  <span>ROAD RISK</span>

                  <strong>HIGH</strong>

                </div>

              </div>

              <div className="map-floating ai-box">

                <BrainCircuit size={15} />

                <div>

                  <span>AI ANALYSIS</span>

                  <strong>94% CONFIDENCE</strong>

                </div>

              </div>

              <div className="map-floating safe-box">

                <CheckCircle2 size={15} />

                <div>

                  <span>ROUTE STATUS</span>

                  <strong>SAFE ROUTE</strong>

                </div>

              </div>

            </div>

            <div className="intelligence-stats">

              <div>

                <BrainCircuit size={17} />

                <span>AI CONFIDENCE</span>

                <strong>94%</strong>

              </div>

              <div>

                <Activity size={17} />

                <span>ROAD HEALTH</span>

                <strong>91/100</strong>

              </div>

              <div>

                <AlertTriangle size={17} />

                <span>ACTIVE ALERTS</span>

                <strong>24</strong>

              </div>

              <div>

                <Navigation size={17} />

                <span>SAFE ROUTE</span>

                <strong>12 MIN</strong>

              </div>

            </div>

          </div>

          {/* =================================================
              TRUST ITEMS
          ================================================== */}

          <div className="hero-features">

            <div>

              <div className="feature-icon">

                <BrainCircuit size={18} />

              </div>

              <div>

                <strong>DETECT</strong>

                <span>
                  AI road intelligence
                </span>

              </div>

            </div>

            <div>

              <div className="feature-icon">

                <Activity size={18} />

              </div>

              <div>

                <strong>PREDICT</strong>

                <span>
                  Dynamic risk analysis
                </span>

              </div>

            </div>

            <div>

              <div className="feature-icon">

                <Navigation size={18} />

              </div>

              <div>

                <strong>RESPOND</strong>

                <span>
                  Emergency routing
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            LOGIN CARD
        ==================================================== */}

        <div className="login-panel-wrapper">

          <div className="login-panel">

            <div className="secure-badge">

              <LockKeyhole size={15} />

              SECURE ACCESS

            </div>

            <div className="login-heading">

              <span>
                WELCOME BACK
              </span>

              <h2>
                Sign in to Prahari
              </h2>

              <p>
                Continue protecting your roads
                and community.
              </p>

            </div>

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              {/* EMAIL */}

              <label>

                <span>
                  Email address
                </span>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

              </label>

              {/* PASSWORD */}

              <label>

                <div className="password-label">

                  <span>
                    Password
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/citizen/home")
                    }
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </label>

              {/* ERROR */}

              {error && (

                <div className="login-error">

                  <AlertTriangle size={16} />

                  {error}

                </div>

              )}

              {/* REMEMBER */}

              <div className="login-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <span className="protected-text">

                  <Wifi size={13} />

                  Protected by Prahari

                </span>

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    Sign in to Prahari
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="login-divider">

              <span></span>

              <p>NEW TO PRAHARI?</p>

              <span></span>

            </div>

            {/* REGISTER */}

            <button
              className="create-account-button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create citizen account
              <ArrowRight size={16} />
            </button>

            {/* SECURITY */}

            <div className="login-security">

              <div className="security-icon">

                <ShieldCheck size={17} />

              </div>

              <div>

                <strong>
                  Your data stays protected
                </strong>

                <span>
                  Secure authentication and
                  encrypted communication.
                </span>

              </div>

            </div>

            <p className="login-legal">

              By continuing, you agree to Prahari's
              Terms of Service and Privacy Policy.

            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="login-footer">

        <div>

          <span className="footer-dot"></span>

          PRAHARI INTELLIGENCE NETWORK

          <i></i>

          SYSTEM STATUS:

          <strong>OPERATIONAL</strong>

        </div>

        <div>

          <span>

            <MapPin size={13} />

            INDIA ROAD NETWORK

          </span>

          <span>

            <Radio size={13} />

            REAL-TIME INTELLIGENCE

          </span>

          <span>

            <Sparkles size={13} />

            AI POWERED

          </span>

        </div>

      </footer>

    </main>
  );
}

export default Login;