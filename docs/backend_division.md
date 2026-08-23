# RoadGuard AI: Backend Development Division

Based on the provided architecture and modules, the backend work has been divided into three distinct roles. This ensures all modules (Defect Detection, Routing, Risk Prediction, Emergency Routing, and Dashboards) are covered thoroughly.

## Recommended Stack
*   **Primary Backend:** Node.js + Express
*   **Database:** MongoDB (Crucial to utilize GeoJSON and `2dsphere` indexes for location-based queries).
*   **Microservice (ML & Routing):** Python (FastAPI) for Computer Vision, Risk Prediction, and Graph Routing algorithms (Dijkstra/A*).

### Libraries & Dependencies
*   **Core / Server:** `express`, `cors`, `dotenv`
*   **Database:** `mongoose`
*   **Authentication & Security:** `jsonwebtoken`, `bcryptjs`
*   **File Uploads:** `multer`, `cloudinary`
*   **Validation:** `zod`
*   **Utilities (Internal APIs):** `axios`
*   **Development Tools:** `nodemon`, `morgan`

---

## 🧑‍💻 Person 1: Citizen Complaints & Authority Workflow (Modules 1, 2, 5)
**Focus:** User management, AI infrastructure defect reporting workflow, automatic department routing, and complaint resolution tracking.

### Schemas (Mongoose/MongoDB)
*   **User:**
    *   `_id`, `name`, `email`, `password_hash`, `role` (CITIZEN, AUTHORITY, EMERGENCY), `department_id` (ObjectId, ref: Department, nullable), `created_at`
*   **Department:**
    *   `_id`, `name` (e.g., Road, Electrical, Sanitation, Public Works), `contact_email`
*   **Complaint:**
    *   `_id`, `citizen_id` (ObjectId, ref: User)
    *   `photo_url`
    *   `defect_type` (POTHOLE, BROKEN_STREETLIGHT, GARBAGE, DRAINAGE, OTHER)
    *   `severity` (LOW, MEDIUM, HIGH, CRITICAL)
    *   `location` (GeoJSON Point - coordinates: [longitude, latitude])
    *   `status` (REPORTED, AI_VERIFIED, ASSIGNED, WORK_IN_PROGRESS, RESOLVED)
    *   `assigned_department_id` (ObjectId, ref: Department)
    *   `created_at`, `updated_at`, `resolved_at`

### Routes
*   **Authentication:**
    *   `POST /api/auth/register` - Register a new citizen, authority, or emergency personnel.
    *   `POST /api/auth/login` - Authenticate and return JWT.
    *   `GET /api/auth/me` - Get current user profile.
*   **Complaints (Citizen & Core Flow):**
    *   `POST /api/complaints` - Upload photo and GPS. *Logic: Calls ML vision service, classifies defect, calculates severity, determines department, saves to DB.*
    *   `GET /api/complaints/me` - Fetch complaints submitted by the logged-in citizen (Module 5).
    *   `GET /api/complaints/:id` - View single complaint details and tracking timeline.
*   **Complaints (Authority):**
    *   `GET /api/complaints` - View all complaints. Includes query params for filtering by `department_id`, `status`, and `severity`.
    *   `PATCH /api/complaints/:id/status` - Update complaint status (e.g., to Work In Progress, Resolved).
*   **Departments:**
    *   `GET /api/departments` - List departments for manual reassignment if AI misclassifies.

---

## 🧑‍💻 Person 2: Emergency Intelligent Routing & Entities (Module 4)
**Focus:** Managing emergency entities (hospitals, ambulances, accidents) and calculating the safest and fastest route dynamically.

### Schemas (Mongoose/MongoDB)
*   **Accident:**
    *   `_id`, `reported_by` (ObjectId, ref: User), `location` (GeoJSON Point), `severity`, `status` (REPORTED, RESPONDING, CLEARED), `created_at`
*   **Ambulance:**
    *   `_id`, `vehicle_number`, `current_location` (GeoJSON Point), `status` (AVAILABLE, DISPATCHED, MAINTENANCE), `hospital_id` (ObjectId, ref: Hospital)
*   **Hospital:**
    *   `_id`, `name`, `location` (GeoJSON Point), `capacity_status`
*   **RoadBlockage:**
    *   `_id`, `location` (GeoJSON Point or LineString), `reason`, `reported_at`, `is_active`

### Routes
*   **Accidents:**
    *   `POST /api/accidents` - Citizen or authority reports a new accident.
    *   `GET /api/accidents` - List active accidents for the Emergency Dashboard.
    *   `PATCH /api/accidents/:id/status` - Update accident status.
*   **Emergency Resources:**
    *   `GET /api/ambulances` - Find nearby available ambulances using MongoDB geospatial queries (e.g., `$near`).
    *   `PATCH /api/ambulances/:id/location` - Real-time GPS ping endpoint for ambulances.
    *   `GET /api/hospitals` - List nearby hospitals.
*   **Intelligent Routing Engine:**
    *   `POST /api/emergency/route` - **Core Algorithm Route**.
        *   *Input:* Accident location.
        *   *Process:* Identifies nearest available ambulance and hospital. Pulls infrastructure defects (from Person 1), active blockages, and risk scores (from Person 3). Sends graph data to Python Routing Engine (e.g., Dijkstra/A*/OR-Tools).
        *   *Output:* Returns the recommended fastest + safest route coordinates, distance, and ETA.
*   **Road Blockages:**
    *   `POST /api/blockages` - Report a temporary road closure.
    *   `GET /api/blockages` - Fetch active blockages for map layers.

---

## 🧑‍💻 Person 3: ML Services, Risk Mapping & Analytics (Module 3 & Dashboards)
**Focus:** Connecting the Node.js backend to Python ML microservices, aggregating data for the Dynamic Road Risk Map, and providing analytics for the authority dashboard.

### Schemas (Mongoose/MongoDB)
*   **RiskZone / RoadSegment:**
    *   `_id`, `geometry` (GeoJSON LineString/Polygon)
    *   `risk_score` (LOW, MEDIUM, HIGH)
    *   `factors` (Object containing weight of weather, defects, traffic)
    *   `last_calculated_at`
*   **HistoricalData:**
    *   Schema to store/cache weather, traffic density, and historical government accident datasets.

### Routes
*   **ML Service Integration (Internal Node to Python APIs):**
    *   `POST /api/internal/detect-defect` - Proxies image data to Python FastAPI vision model (utilized by Person 1's complaint route).
    *   `POST /api/internal/predict-risk` - Triggers the accident risk model to recalculate risk scores based on updated defects, traffic, and weather data. Can be run via a cron job.
*   **Dynamic Road Risk Map (GeoJSON feeds for Frontend Mapbox/Leaflet):**
    *   `GET /api/map/hotspots` - Returns predicted accident-risk zones (red, yellow, green) based on `RiskZone` schema.
    *   `GET /api/map/defects` - Returns active potholes, broken lights, etc., formatted for map layers.
    *   `GET /api/map/traffic` - Returns current simulated or live congestion information.
*   **Analytics & Dashboard Stats (Authority Dashboard):**
    *   `GET /api/analytics/authority-summary` - Returns aggregate statistics: total reports, pending complaints, WIP, resolved complaints.
    *   `GET /api/analytics/safety-stats` - Identifies roads with the highest number of critical defects and historical accidents.
