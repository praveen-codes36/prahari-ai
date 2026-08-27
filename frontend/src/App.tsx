import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { authService, ROLE_PRESETS } from './services/authService';

// Citizen Pages
import { CitizenHome } from './pages/citizen/CitizenHome';
import { RoadRiskMapPage } from './pages/citizen/RoadRiskMapPage';
import { ReportDefectFlow } from './pages/citizen/ReportDefectFlow';
import { ReportAccidentPage } from './pages/citizen/ReportAccidentPage';
import { MyReportsPage } from './pages/citizen/MyReportsPage';
import { CitizenAIAssistant } from './pages/citizen/CitizenAIAssistant';

// Authority Pages
import { AuthorityOverview } from './pages/authority/AuthorityOverview';
import { AIRiskIntelligencePage } from './pages/authority/AIRiskIntelligencePage';
import { RepairPriorityQueue } from './pages/authority/RepairPriorityQueue';
import { ComplaintsManagement } from './pages/authority/ComplaintsManagement';
import { RoadHealthAnalytics } from './pages/authority/RoadHealthAnalytics';
import { EmergencyRouteOptimizer } from './pages/authority/EmergencyRouteOptimizer';
import { SimulationCenter } from './pages/authority/SimulationCenter';
import { AICopilotPage } from './pages/authority/AICopilotPage';
import { GlobalRiskMapPage } from './pages/authority/GlobalRiskMapPage';
import { SystemAlertsPage } from './pages/authority/SystemAlertsPage';
import { MaintenanceCommandCenter } from './pages/authority/MaintenanceCommandCenter';
import { FieldTeamManagement } from './pages/authority/FieldTeamManagement';
import { WorkOrderSystem } from './pages/authority/WorkOrderSystem';
import { FieldWorkerMobileApp } from './pages/authority/FieldWorkerMobileApp';
import { PredictiveMaintenancePage } from './pages/authority/PredictiveMaintenancePage';
import { IntelligenceLoopVisualizer } from './pages/authority/IntelligenceLoopVisualizer';

// Operations Pages
import { EmergencyOperations } from './pages/emergency/EmergencyOperations';

// Root redirect helper component
function RootRedirect() {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  const role = authService.getCurrentRole();
  const targetRoute = ROLE_PRESETS[role]?.targetRoute || '/authority';
  return <Navigate to={targetRoute} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Authentication Command Center Entry */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Workspace Shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<RootRedirect />} />
          
          {/* Authority Perspective Routes */}
          <Route path="authority" element={<ProtectedRoute allowedRoles={['authority']}><Outlet /></ProtectedRoute>}>
            <Route index element={<AuthorityOverview />} />
            <Route path="risk-intel" element={<AIRiskIntelligencePage />} />
            <Route path="priority" element={<RepairPriorityQueue />} />
            <Route path="complaints" element={<ComplaintsManagement />} />
            <Route path="road-health" element={<RoadHealthAnalytics />} />
            <Route path="copilot" element={<AICopilotPage />} />
            <Route path="emergency-ops" element={<EmergencyOperations />} />
            <Route path="emergency-routes" element={<EmergencyRouteOptimizer />} />
            <Route path="simulation" element={<SimulationCenter />} />
            <Route path="global-map" element={<GlobalRiskMapPage />} />
            <Route path="alerts" element={<SystemAlertsPage />} />
            <Route path="maintenance-command" element={<MaintenanceCommandCenter />} />
            <Route path="field-teams" element={<FieldTeamManagement />} />
            <Route path="work-orders" element={<WorkOrderSystem />} />
            <Route path="field-app" element={<FieldWorkerMobileApp />} />
            <Route path="predictive" element={<PredictiveMaintenancePage />} />
            <Route path="intelligence-loop" element={<IntelligenceLoopVisualizer />} />
          </Route>

          {/* Citizen Perspective Routes */}
          <Route path="citizen" element={<ProtectedRoute allowedRoles={['citizen']}><Outlet /></ProtectedRoute>}>
            <Route index element={<CitizenHome />} />
            <Route path="risk-map" element={<RoadRiskMapPage />} />
            <Route path="report-defect" element={<ReportDefectFlow />} />
            <Route path="report-accident" element={<ReportAccidentPage />} />
            <Route path="my-reports" element={<MyReportsPage />} />
            <Route path="reports/:id" element={<MyReportsPage />} />
            <Route path="assistant" element={<CitizenAIAssistant />} />
          </Route>

          {/* Direct Role Aliases */}
          <Route path="emergency" element={<ProtectedRoute allowedRoles={['emergency']}><EmergencyOperations /></ProtectedRoute>} />
          <Route path="maintenance" element={<ProtectedRoute allowedRoles={['maintenance']}><MaintenanceCommandCenter /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
