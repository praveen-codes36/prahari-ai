import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudRain,
  FileWarning,
  Home,
  LogOut,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Plus,
  Radio,
  Route,
  Shield,
  ShieldCheck,
  Siren,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

import "./CitizenHome.css";

function CitizenHome() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [activeNav, setActiveNav] =
    useState("home");

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const userEmail =
    localStorage.getItem(
      "prahari_user_email"
    ) || "citizen@prahari.ai";

  /*
  |--------------------------------------------------------------------------
  | Protect page
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "prahari_logged_in"
      ) === "true";

    if (!loggedIn) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Live clock
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const goTo = (page, path) => {
    setActiveNav(page);
    setMobileMenu(false);

    navigate(path);
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    localStorage.removeItem(
      "prahari_logged_in"
    );

    localStorage.removeItem(
      "prahari_user_email"
    );

    localStorage.removeItem(
      "prahari_remember_me"
    );

    navigate("/login", {
      replace: true,
    });
  };

  const formattedTime =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <main className="citizen-page">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="citizen-background">

        <div className="citizen-grid"></div>

        <div className="citizen-glow citizen-glow-one"></div>

        <div className="citizen-glow citizen-glow-two"></div>

      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="citizen-header">

        <div className="citizen-header-inner">

          {/* BRAND */}

          <button
            className="citizen-brand"
            onClick={() =>
              goTo(
                "home",
                "/citizen/home"
              )
            }
          >

            <div className="citizen-logo">

              <ShieldCheck size={24} />

            </div>

            <div className="citizen-brand-copy">

              <strong>PRAHARI</strong>

              <span>
                AI ROAD SAFETY NETWORK
              </span>

            </div>

          </button>

          {/* NAVIGATION */}

          <nav className="citizen-nav">

            <button
              className={
                activeNav === "home"
                  ? "citizen-nav-item active"
                  : "citizen-nav-item"
              }
              onClick={() =>
                goTo(
                  "home",
                  "/citizen/home"
                )
              }
            >

              <Home size={15} />

              Home

            </button>

            <button
              className={
                activeNav === "reports"
                  ? "citizen-nav-item active"
                  : "citizen-nav-item"
              }
              onClick={() =>
                goTo(
                  "reports",
                  "/citizen/reports"
                )
              }
            >

              <FileWarning size={15} />

              My Reports

            </button>

            <button
              className={
                activeNav === "map"
                  ? "citizen-nav-item active"
                  : "citizen-nav-item"
              }
              onClick={() =>
                goTo(
                  "map",
                  "/citizen/risk-map"
                )
              }
            >

              <Map size={15} />

              Risk Map

            </button>

            <button
              className={
                activeNav === "chatbot"
                  ? "citizen-nav-item active"
                  : "citizen-nav-item"
              }
              onClick={() =>
                goTo(
                  "chatbot",
                  "/citizen/chatbot"
                )
              }
            >

              <MessageCircle size={15} />

              AI Assistant

            </button>

            <button
              className={
                activeNav === "alerts"
                  ? "citizen-nav-item active"
                  : "citizen-nav-item"
              }
              onClick={() =>
                goTo(
                  "alerts",
                  "/citizen/alerts"
                )
              }
            >

              <Bell size={15} />

              Alerts

              <span className="nav-alert-count">
                2
              </span>

            </button>

          </nav>

          {/* RIGHT */}

          <div className="citizen-header-right">

            <div className="header-network-status">

              <span className="network-pulse"></span>

              NETWORK

              <strong>ONLINE</strong>

            </div>

            <button
              className="header-profile"
              onClick={() =>
                goTo(
                  "profile",
                  "/citizen/profile"
                )
              }
            >

              <div className="profile-avatar">

                <User size={16} />

              </div>

              <div className="profile-text">

                <strong>Citizen</strong>

                <span>{userEmail}</span>

              </div>

              <ChevronRight size={15} />

            </button>

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu(
                  (previous) =>
                    !previous
                )
              }
            >

              {mobileMenu ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}

            </button>

          </div>

        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (

          <div className="mobile-navigation">

            <button
              onClick={() =>
                goTo(
                  "home",
                  "/citizen/home"
                )
              }
            >
              <Home size={16} />
              Home
            </button>

            <button
              onClick={() =>
                goTo(
                  "reports",
                  "/citizen/reports"
                )
              }
            >
              <FileWarning size={16} />
              My Reports
            </button>

            <button
              onClick={() =>
                goTo(
                  "map",
                  "/citizen/risk-map"
                )
              }
            >
              <Map size={16} />
              Risk Map
            </button>

            <button
              onClick={() =>
                goTo(
                  "chatbot",
                  "/citizen/chatbot"
                )
              }
            >
              <MessageCircle size={16} />
              AI Assistant
            </button>

            <button
              onClick={() =>
                goTo(
                  "alerts",
                  "/citizen/alerts"
                )
              }
            >
              <Bell size={16} />
              Alerts
            </button>

            <button
              onClick={() =>
                goTo(
                  "profile",
                  "/citizen/profile"
                )
              }
            >
              <User size={16} />
              Profile
            </button>

            <button
              className="mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        )}

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="citizen-container">

        {/* ===================================================
            WELCOME
        ==================================================== */}

        <section className="welcome-section">

          <div>

            <div className="welcome-status">

              <span></span>

              PRAHARI CITIZEN NETWORK

            </div>

            <h1>

              Welcome back,

              <span>
                stay safe out there.
              </span>

            </h1>

            <p>

              Your road safety intelligence is active.
              Monitor risks, report hazards and help
              make every journey safer.

            </p>

          </div>

          <div className="welcome-time">

            <div>

              <Clock3 size={16} />

              {formattedTime}

            </div>

            <span>
              {formattedDate}
            </span>

          </div>

        </section>

        {/* ===================================================
            NETWORK STATUS
        ==================================================== */}

        <section className="operational-strip">

          <div className="operational-left">

            <div className="operational-icon">

              <Radio size={19} />

            </div>

            <div>

              <span>
                ROAD SAFETY NETWORK
              </span>

              <strong>
                Operational across your area
              </strong>

            </div>

          </div>

          <div className="operational-right">

            <span>

              <i></i>

              LIVE INTELLIGENCE

            </span>

            <span>

              <Navigation size={13} />

              INDIA ROAD NETWORK

            </span>

          </div>

        </section>

        {/* ===================================================
            STATS
        ==================================================== */}

        <section className="dashboard-stats">

          <article className="dashboard-stat-card">

            <div className="stat-top">

              <div className="stat-icon blue">

                <FileWarning size={19} />

              </div>

              <span>
                +1 this week
              </span>

            </div>

            <label>
              MY OPEN REPORTS
            </label>

            <strong>
              3
            </strong>

            <div className="stat-bottom">

              Awaiting resolution

              <ArrowRight size={13} />

            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="stat-top">

              <div className="stat-icon green">

                <CheckCircle2 size={19} />

              </div>

              <span>
                70% resolved
              </span>

            </div>

            <label>
              RESOLVED REPORTS
            </label>

            <strong>
              7
            </strong>

            <div className="stat-bottom">

              Community impact

              <ArrowRight size={13} />

            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="stat-top">

              <div className="stat-icon red">

                <Bell size={19} />

              </div>

              <span>
                2 new
              </span>

            </div>

            <label>
              NEARBY ALERTS
            </label>

            <strong>
              2
            </strong>

            <div className="stat-bottom">

              Within your area

              <ArrowRight size={13} />

            </div>

          </article>

          <article className="dashboard-stat-card">

            <div className="stat-top">

              <div className="stat-icon cyan">

                <BrainCircuit size={19} />

              </div>

              <span>
                AI active
              </span>

            </div>

            <label>
              ROAD SAFETY SCORE
            </label>

            <strong>
              91<span>/100</span>
            </strong>

            <div className="stat-bottom">

              Your area health

              <ArrowRight size={13} />

            </div>

          </article>

        </section>

        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section className="dashboard-main-grid">

          {/* =================================================
              LEFT
          ================================================== */}

          <div className="dashboard-left">

            {/* QUICK ACTIONS */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    TAKE ACTION
                  </span>

                  <h2>
                    Quick actions
                  </h2>

                </div>

                <Zap size={18} />

              </div>

              <div className="quick-actions">

                <button
                  className="quick-action"
                  onClick={() =>
                    navigate(
                      "/citizen/reports/new"
                    )
                  }
                >

                  <div className="quick-action-icon">

                    <Plus size={20} />

                  </div>

                  <div>

                    <strong>
                      Report a road defect
                    </strong>

                    <span>
                      Potholes, damaged roads,
                      streetlights & more
                    </span>

                  </div>

                  <ArrowRight size={16} />

                </button>

                <button
                  className="quick-action accident"
                  onClick={() =>
                    navigate(
                      "/citizen/reports/accident"
                    )
                  }
                >

                  <div className="quick-action-icon">

                    <Siren size={19} />

                  </div>

                  <div>

                    <strong>
                      Report an accident
                    </strong>

                    <span>
                      Quickly alert the safety network
                    </span>

                  </div>

                  <ArrowRight size={16} />

                </button>

                <button
                  className="quick-action"
                  onClick={() =>
                    navigate(
                      "/citizen/risk-map"
                    )
                  }
                >

                  <div className="quick-action-icon">

                    <Map size={19} />

                  </div>

                  <div>

                    <strong>
                      Explore risk map
                    </strong>

                    <span>
                      View live road safety conditions
                    </span>

                  </div>

                  <ArrowRight size={16} />

                </button>

              </div>

            </section>

            {/* =================================================
                MAP
            ================================================== */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    REAL-TIME INTELLIGENCE
                  </span>

                  <h2>
                    Road risk around you
                  </h2>

                </div>

                <button
                  className="view-map-button"
                  onClick={() =>
                    navigate(
                      "/citizen/risk-map"
                    )
                  }
                >

                  Open full map

                  <ArrowRight size={13} />

                </button>

              </div>

              <div className="mini-map">

                <div className="map-grid"></div>

                <div className="mini-road road-a"></div>

                <div className="mini-road road-b"></div>

                <div className="mini-road road-c"></div>

                <div className="mini-road road-d"></div>

                <div className="mini-safe-route"></div>

                <div className="user-location">
                  <span></span>
                </div>

                <div className="risk-point green r1"></div>

                <div className="risk-point yellow r2"></div>

                <div className="risk-point red r3"></div>

                <div className="risk-point green r4"></div>

                <div className="map-label high-risk">

                  <AlertTriangle size={12} />

                  HIGH RISK

                </div>

                <div className="map-label safe-route">

                  <CheckCircle2 size={12} />

                  SAFE ROUTE

                </div>

                <div className="map-you">

                  <MapPin size={12} />

                  YOUR AREA

                </div>

                <div className="map-live">

                  <span></span>

                  LIVE

                </div>

              </div>

              <div className="map-stats">

                <div>

                  <span>
                    ROAD HEALTH
                  </span>

                  <strong>
                    91/100
                  </strong>

                </div>

                <div>

                  <span>
                    ACTIVE RISKS
                  </span>

                  <strong>
                    24
                  </strong>

                </div>

                <div>

                  <span>
                    SAFE ROUTE
                  </span>

                  <strong>
                    12 MIN
                  </strong>

                </div>

                <div>

                  <span>
                    AI CONFIDENCE
                  </span>

                  <strong>
                    94%
                  </strong>

                </div>

              </div>

            </section>

            {/* =================================================
                REPORTS
            ================================================== */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    ACTIVITY
                  </span>

                  <h2>
                    Recent reports
                  </h2>

                </div>

                <button
                  className="view-map-button"
                  onClick={() =>
                    navigate(
                      "/citizen/reports"
                    )
                  }
                >

                  View all

                  <ArrowRight size={13} />

                </button>

              </div>

              <div className="activity-list">

                <div className="activity-row">

                  <div className="activity-icon work">

                    <Activity size={16} />

                  </div>

                  <div className="activity-content">

                    <strong>
                      Pothole — MG Road
                    </strong>

                    <span>
                      Report #PRH-1042 • 2 hours ago
                    </span>

                  </div>

                  <b className="status-progress">
                    WORK IN PROGRESS
                  </b>

                  <ChevronRight size={15} />

                </div>

                <div className="activity-row">

                  <div className="activity-icon resolved">

                    <CheckCircle2 size={16} />

                  </div>

                  <div className="activity-content">

                    <strong>
                      Streetlight — Civil Lines
                    </strong>

                    <span>
                      Report #PRH-1028 • Yesterday
                    </span>

                  </div>

                  <b className="status-resolved">
                    RESOLVED
                  </b>

                  <ChevronRight size={15} />

                </div>

                <div className="activity-row">

                  <div className="activity-icon received">

                    <Radio size={16} />

                  </div>

                  <div className="activity-content">

                    <strong>
                      Road sign damage
                    </strong>

                    <span>
                      Report #PRH-1019 • 3 days ago
                    </span>

                  </div>

                  <b className="status-received">
                    RECEIVED
                  </b>

                  <ChevronRight size={15} />

                </div>

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT
          ================================================== */}

          <aside className="dashboard-right">

            {/* AI */}

            <section className="ai-card">

              <div className="ai-card-top">

                <div className="ai-icon">

                  <BrainCircuit size={20} />

                </div>

                <div>

                  <span>
                    AI SAFETY ASSISTANT
                  </span>

                  <strong>
                    Ready to help
                  </strong>

                </div>

                <i></i>

              </div>

              <p>

                Ask Prahari about road risks,
                safe routes, nearby hazards or
                how to report an issue.

              </p>

              <button
                onClick={() =>
                  navigate(
                    "/citizen/chatbot"
                  )
                }
              >

                <MessageCircle size={16} />

                Talk to Prahari AI

                <ArrowRight size={15} />

              </button>

            </section>

            {/* ALERTS */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    SAFETY ALERTS
                  </span>

                  <h2>
                    Nearby
                  </h2>

                </div>

                <Bell size={17} />

              </div>

              <div className="alert-list">

                <button className="safety-alert">

                  <div className="alert-icon red">

                    <AlertTriangle size={17} />

                  </div>

                  <div>

                    <strong>
                      High-risk road section
                    </strong>

                    <span>
                      1.2 km away • AI detected
                    </span>

                  </div>

                  <ChevronRight size={14} />

                </button>

                <button className="safety-alert">

                  <div className="alert-icon blue">

                    <CloudRain size={17} />

                  </div>

                  <div>

                    <strong>
                      Reduced visibility
                    </strong>

                    <span>
                      2.8 km away • Weather risk
                    </span>

                  </div>

                  <ChevronRight size={14} />

                </button>

              </div>

              <button
                className="view-alerts"
                onClick={() =>
                  navigate(
                    "/citizen/alerts"
                  )
                }
              >

                View all safety alerts

                <ArrowRight size={13} />

              </button>

            </section>

            {/* COMMUNITY */}

            <section className="community-card">

              <div className="community-icon">

                <Users size={20} />

              </div>

              <div>

                <span>
                  COMMUNITY IMPACT
                </span>

                <strong>
                  You're helping make roads safer.
                </strong>

                <p>
                  Your reports contribute to
                  Prahari's AI road intelligence.
                </p>

              </div>

              <div className="community-number">

                <strong>
                  10.8K
                </strong>

                <span>
                  reports
                </span>

              </div>

            </section>

            {/* CONDITIONS */}

            <section className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    AREA CONDITIONS
                  </span>

                  <h2>
                    Current safety
                  </h2>

                </div>

                <Activity size={17} />

              </div>

              <div className="condition-score">

                <div className="score-ring">

                  <strong>
                    91
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

                <div>

                  <strong>
                    Good conditions
                  </strong>

                  <span>
                    AI road-health assessment
                  </span>

                  <div className="score-progress">

                    <i></i>

                  </div>

                </div>

              </div>

              <div className="condition-items">

                <div>

                  <Navigation size={14} />

                  <span>
                    Traffic
                  </span>

                  <strong>
                    Normal
                  </strong>

                </div>

                <div>

                  <CloudRain size={14} />

                  <span>
                    Weather
                  </span>

                  <strong>
                    Clear
                  </strong>

                </div>

                <div>

                  <Route size={14} />

                  <span>
                    Roads
                  </span>

                  <strong>
                    Safe
                  </strong>

                </div>

              </div>

            </section>

            {/* LOGOUT */}

            <button
              className="dashboard-logout"
              onClick={handleLogout}
            >

              <LogOut size={16} />

              Sign out of Prahari

            </button>

          </aside>

        </section>

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="citizen-footer">

        <div>

          <span></span>

          PRAHARI INTELLIGENCE NETWORK

          <i></i>

          SYSTEM STATUS:

          <strong>
            OPERATIONAL
          </strong>

        </div>

        <div>

          <span>
            <Shield size={12} />
            SECURE
          </span>

          <span>
            <Radio size={12} />
            REAL-TIME
          </span>

          <span>
            <BrainCircuit size={12} />
            AI POWERED
          </span>

        </div>

      </footer>

    </main>
  );
}

export default CitizenHome;