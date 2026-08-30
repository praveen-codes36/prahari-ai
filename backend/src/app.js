import express from "express"
import cors from "cors"

import authRoutes from './routes/auth.routes.js';
import accidentsRouter from "./routes/accidents.route.js"
import ambulancesRouter from "./routes/ambulances.route.js"
import hospitalsRouter from "./routes/hospitals.route.js"
import roadBlockagesRouter from "./routes/road_blockages.route.js"
import emergencyRouter from "./routes/emergency.route.js"
import roadHealthRouter from "./routes/road_health.route.js"
import repairPriorityRouter from "./routes/repair_priority.route.js"
import chatbotRouter from "./routes/chatbot.route.js"
import internalRouter from "./routes/internal.route.js"
import complaintsRouter from "./routes/complaints.routes.js";
import departmentsRouter from "./routes/departments.route.js";
import copilotRouter from "./routes/copilot.route.js";
import authorityRouter from "./routes/authority.route.js";
import fieldTeamsRouter from "./routes/field_team.route.js";
const app = express()

// basic configurations
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))
app.use("/sample_images", express.static("public/sample_images"))

// cors configurations
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"]
}))

app.get('/', (req, res) => {
  res.send('Welcome to Prahari-AI')
})

// ---- Route mounting ----

app.use('/api/auth', authRoutes);
app.use("/api/accidents", accidentsRouter)
app.use("/api/ambulances", ambulancesRouter)
app.use("/api/hospitals", hospitalsRouter)
app.use("/api/departments", departmentsRouter)
app.use("/api/complaints", complaintsRouter);
app.use("/api/blockages", roadBlockagesRouter)
app.use("/api/emergency", emergencyRouter)        // Feature 3 (routing) + Feature 5 (dashboard)
app.use("/api/roads", roadHealthRouter)           // Feature 8
app.use("/api/chatbot/citizen", chatbotRouter)    // Feature 11
app.use("/api/internal", internalRouter)          // Cron / service-to-service endpoints
app.use("/api/authority", authorityRouter)
app.use("/api/field-teams", fieldTeamsRouter)   // Field Operations: Field Team Management page

import riskRouter from "./routes/risk.route.js"
import mapRouter from "./routes/map.route.js"
import alertRouter from "./routes/alert.route.js"
import simulationRouter from "./routes/simulation.route.js"
import maintenanceRouter from "./routes/maintenance.route.js"

// routes declaration
app.use("/api/risk", riskRouter)
app.use("/api/map", mapRouter)
app.use("/api/alerts", alertRouter)
app.use("/api/simulation", simulationRouter)

// Mount the Repair Priority router at /api
app.use("/api", repairPriorityRouter)
app.use("/api/maintenance", maintenanceRouter)
app.use("/api/copilot", copilotRouter)

export default app
