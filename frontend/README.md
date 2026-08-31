# Prahari-AI : Frontend Application

Welcome to the frontend application for **Prahari-AI**, the AI-Powered Road Safety, Infrastructure Monitoring & Emergency Routing Platform. This React-based single-page application (SPA) serves as the unified dashboard for all stakeholders in the Prahari ecosystem: Citizens, Municipal Authorities, and Emergency Responders.

## 🚀 Tech Stack

The frontend is built with modern web technologies, focusing on performance, beautiful dynamic interfaces (glassmorphism), and real-time data visualization.

- **Core Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (for blazing fast HMR and optimized builds)
- **Language**: TypeScript (`.tsx`, `.ts`)
- **Routing**: `react-router-dom` (Role-based protected routing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS (`index.css`)
- **Maps & Geospatial**: `react-leaflet` (Leaflet.js integration) + `d3-geo`
- **Animations**: `framer-motion` (for micro-animations and smooth page transitions)
- **Icons**: `lucide-react`
- **Network & State**: `axios` for HTTP API requests + React Context/Hooks for state management

## 📂 Deep Dive: Directory Structure

The `src/` folder is heavily modularized to maintain clean separation of concerns across the different user personas.

### 1. `pages/` (Role-Based Dashboards)
The application defines unique experiences based on the user's role:

- **`citizen/`**: Pages for everyday citizens to interact with the system.
  - `CitizenHome.tsx`: The primary dashboard for citizens.
  - `ReportDefectFlow.tsx`: The main user flow to capture an image, upload it, and send it to the AI for defect triage.
  - `MyReportsPage.tsx`: Tracks the status of the citizen's submitted complaints.
  - `CitizenAIAssistant.tsx` & `Chatbot.jsx`: Conversational interfaces for citizens to ask questions or report issues.
  - `RoadRiskMapPage.tsx` & `ReportAccidentPage.tsx`: Citizen-facing safety and SOS alerts.

- **`authority/`**: Heavy-duty analytics and command center for Municipal Authorities.
  - `AuthorityOverview.tsx`: The high-level command center dashboard.
  - `ComplaintsManagement.tsx` & `WorkOrderSystem.tsx`: For tracking and escalating AI-triaged civic defects.
  - `PredictiveMaintenancePage.tsx` & `RoadHealthAnalytics.tsx`: Displays the 30-day degradation forecast from the ML Python engine.
  - `RepairPriorityQueue.tsx`: Uses AI to rank work orders based on impending risk rather than just complaint age.
  - `FieldTeamManagement.tsx` & `FieldWorkerMobileApp.tsx`: Assigns physical repair squads and verifies their repair proof via AI.
  - `EmergencyRouteOptimizer.tsx` & `SimulationCenter.tsx`: Interfaces to visualize and test dynamic routing algorithms avoiding risk zones.

- **`emergency/`** & **`maintenance/`**:
  - Specialized dashboards (`EmergencyOperations.tsx`, `MaintenanceDashboard.tsx`) tailored for ambulance dispatchers and direct field managers.

### 2. `components/` (Reusable UI)
- **`map/`**: Contains `InteractiveMapCanvas.tsx` and `RouteOptimizationMap.tsx`. These wrap Leaflet.js to plot geoJSON data, render the predictive risk heatmaps, and draw emergency paths.
- **`common/`**: Reusable layout widgets like `Header.tsx`, `Sidebar.tsx`, `StatCard.tsx`, `HealthScoreCircle.tsx`, and `Badges.tsx`.
- **`auth/`**: Shared login and registration forms.

### 3. `services/` (API Integration Layer)
All backend communication is abstracted into service classes using Axios.
- `aiDefectService.ts`: Handles multipart form uploads for AI vision classification.
- `routeOptimizationService.ts`: Fetches the dynamically weighted OSRM paths from the backend.
- `fieldOpsService.ts`: Manages team assignments and repair verifications.
- `authService.ts`: JWT token management and authentication flows.
- `aiCopilotService.ts` & `aiChatbotService.ts`: Interfaces with LLMs (like Gemini) via the Node.js proxy.

### 4. `layouts/`
- `AppShell.tsx`: The root layout wrapper handling the responsive sidebar, top navigation, and main content rendering area.

## 🛠️ Local Development & Setup

### Prerequisites
Make sure you have Node.js (v18+) and `npm` installed.

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file and create a `.env` file in the `frontend/` directory.

```bash
cp .env.example .env
```

Ensure the following variables are set (they tell the frontend where the Node.js backend lives):
```env
VITE_API_BASE_URL=http://localhost:5000
# Add your Mapbox or Leaflet tile tokens here if you are using premium tile servers
```

### 3. Run the Development Server
```bash
npm run dev
```

The Vite server will start. Open `http://localhost:3000` (or the port specified in your console) in your browser.

## 🎨 Design System & Aesthetics
Prahari-AI's frontend prioritizes a premium, modern aesthetic:
- **Dark Mode Default**: Reduces glare for authority command centers running 24/7.
- **Glassmorphism**: Panels and overlays use translucent backgrounds (`backdrop-blur`) to create depth over the interactive maps.
- **Micro-interactions**: Framer Motion is utilized heavily on buttons, modals, and page transitions to make the application feel responsive and alive.
- **Data Visualization**: Complex AI metrics (like risk confidence, 30-day degradation velocities) are simplified using visual cues (e.g., `HealthScoreCircle.tsx`, `AIConfidenceRing.tsx`).

## 📡 State Management & Real-Time Data
- **REST APIs**: Axios is used for standard CRUD operations and fetching large datasets.
- **WebSockets (Socket.IO)**: (Configured via the backend) Pushes real-time alerts to the `SystemAlertsPage.tsx` and updates the `InteractiveMapCanvas` dynamically when a new high-severity defect is logged.

## 📦 Build for Production
To bundle the application for deployment (e.g., on Vercel, Netlify, or an Nginx server):
```bash
npm run build
```
The optimized static assets will be generated in the `dist/` folder. You can test the production build locally using:
```bash
npm run preview
```
