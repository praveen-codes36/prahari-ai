# Prahari-AI : Backend API Server

Welcome to the backend server for **Prahari-AI**. This Node.js/Express application acts as the central nervous system of the Prahari ecosystem. It handles authentication, data persistence, real-time socket communication, and serves as the primary orchestrator that delegates heavy analytical tasks to the Python ML microservice.

## 🚀 Core Technologies

- **Environment**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v5.x)
- **Database**: [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) ORM
- **Geospatial Capabilities**: Heavy usage of MongoDB `$near` and `2dsphere` indexes for proximity searches.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.js
- **File Handling**: `multer` (for processing citizen image uploads)
- **Real-Time Engine**: `socket.io` (pushing map updates to the Authority dashboard)

---

## 📂 Deep Dive: Architecture & Directory Structure

The backend follows a standard MVC-inspired (Model-View-Controller) structure, but replaces "Views" with JSON API responses.

### 1. `src/models/` (Database Schemas)
All data structures are defined here using Mongoose. We heavily utilize MongoDB's Geospatial queries.
- **`complaint.model.js`**: The most complex schema. Stores citizen defect reports, GPS `Point` coordinates, AI confidence scores, ML-generated repair plans, and material usage logs.
- **`accident.model.js`**, **`hospital.model.js`**, **`ambulance.model.js`**: Entities used by the emergency routing engine.
- **`field_team.model.js`**: Represents municipal repair squads, tracking their current location, status, and active work orders.
- **`risk_zone.model.js`**: Stores the output of the Python predictive maintenance model (30-day forecast heatmaps).

### 2. `src/controllers/` (Business Logic)
This is where the heavy lifting occurs. Controllers receive the HTTP request, interact with the DB, and format the response.
- **`complaints.controller.js`**: 
  - **`createComplaint`**: Receives an image, hits the Python ML endpoint (`/predict`), creates a database record, auto-assigns a municipal department based on the ML classification, and checks for geospatial duplicates.
  - **`submitRepairVerification`**: Field workers upload a photo of their repair. This controller hits the Python `verify_repair` endpoint to validate the fix before closing the ticket.
- **`emergency.controller.js`**:
  - **`getEmergencyRoute`**: The core of the SOS system. Takes an accident coordinate, uses MongoDB `$near` to find the closest available ambulance and hospital. It then packages active road blockages, potholes, and risk zones, and POSTs them to the Python Routing Engine to calculate the safest (not just shortest) path.
- **`orchestration.controller.js`**: Manages the "Closed-Loop" triggers. When a complaint is updated, it tells the ML service to recalculate the city's risk map.

### 3. `src/routes/` (Express Routers)
Maps HTTP methods and URIs to their corresponding controller functions. Protected routes use the `protect` middleware.

### 4. `src/middlewares/`
- **`auth.middleware.js`**: Extracts the Bearer token, verifies the JWT signature, and attaches the user object to `req.user`.

### 5. `src/socket/`
- **`index.js`**: Initializes Socket.IO. When critical events happen (like a high-severity pothole being verified by AI), the Node server emits events here to instantly update the React frontend maps without requiring the client to refresh.

---

## 🔌 Integration with Python ML Microservice

The Node.js backend relies on the Python microservice for heavy AI workloads. It does this via synchronous Axios POST requests. 

**Workflow Example (Image Upload)**:
1. Express receives `multipart/form-data` from React.
2. `multer` saves the image temporarily to `/uploads`.
3. `detectDefectViaML()` in `complaints.controller.js` opens a stream to the file and posts it to `http://localhost:8000/predict` (The Python service).
4. Python runs the PyTorch model and returns a JSON payload with `defect_type`, `severity`, and `confidence_score`.
5. Express resumes processing, builds a MongoDB document with the ML data, and returns 201 Created to React.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js installed.
- A running instance of MongoDB (Local compass or Atlas URI).

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` root directory.

```ini
# MongoDB Connection String (Required)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/prahari_db

# Server Port
PORT=5000

# Authentication
JWT_SECRET=super_secret_string

# Email Service (For OTPs and notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Integrations
ML_SERVICE_URL=http://127.0.0.1:8000
GEMINI_API_KEY=your_gemini_llm_key
```

### 3. Run the Server
```bash
# Starts the server with Nodemon for hot-reloading
npm run dev
```

You should see:
```text
App listening on port http://localhost:5000
MongoDB connection successful
```

---

## 📡 API Design Philosophy

We use standard RESTful conventions wrapping responses in a unified format via `ApiResponse` and `ApiError` utility classes:

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Complaint not found",
  "errors": []
}
```

## 🔒 Security Measures
- **Password Hashing**: Done at the Mongoose Model level using `bcryptjs` before saving.
- **Payload Limits**: Express JSON and URL-encoded parsers are restricted to `16kb` to prevent DOS attacks.
- **CORS**: Configured strictly to allow only the VITE frontend origin (`http://localhost:5173` or `3000`).
