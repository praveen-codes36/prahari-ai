import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import CitizenHome from "./pages/CitizenHome";
import Chatbot from "./pages/Chatbot";

/*
|--------------------------------------------------------------------------
| Protected Route
|--------------------------------------------------------------------------
*/

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("prahari_logged_in") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/*
|--------------------------------------------------------------------------
| Temporary Placeholder Page
|--------------------------------------------------------------------------
|
| These pages can later be replaced by your actual features.
|
*/

function ComingSoon({ title, description }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020914",
        color: "#eaf4ff",
        display: "grid",
        placeItems: "center",
        padding: "30px",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(600px, 100%)",
          padding: "45px",
          border: "1px solid rgba(87, 184, 255, 0.18)",
          borderRadius: "24px",
          background: "rgba(9, 24, 42, 0.8)",
          textAlign: "center",
          boxShadow: "0 30px 100px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            margin: "0 auto 22px",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg,#087cf5,#19d9bd)",
            fontSize: "25px",
          }}
        >
          ✦
        </div>

        <p
          style={{
            color: "#3de0c1",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "2px",
            marginBottom: "10px",
          }}
        >
          PRAHARI
        </p>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "32px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#7f96ae",
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Citizen dashboard */}
      <Route
        path="/citizen/home"
        element={
          <ProtectedRoute>
            <CitizenHome />
          </ProtectedRoute>
        }
      />

      {/* Future pages */}
      <Route
        path="/citizen/reports"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="My Reports"
              description="Your submitted road safety reports will appear here."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/reports/new"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Report a Road Defect"
              description="Report potholes, damaged roads, broken streetlights and other road hazards."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/reports/accident"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Report an Accident"
              description="This section will connect citizens with emergency response services."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/risk-map"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Live Risk Map"
              description="The real-time Prahari road smart system map will be available here."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/alerts"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Safety Alerts"
              description="Nearby road safety alerts and emergency notifications will appear here."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Citizen Profile"
              description="Manage your Prahari citizen profile and preferences."
            />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;