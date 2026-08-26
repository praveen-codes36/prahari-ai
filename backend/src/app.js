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

const app = express()

// basic configurations
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

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
app.use("/api/blockages", roadBlockagesRouter)
app.use("/api/emergency", emergencyRouter)        // Feature 3 (routing) + Feature 5 (dashboard)
app.use("/api/roads", roadHealthRouter)           // Feature 8
app.use("/api/chatbot/citizen", chatbotRouter)    // Feature 11
app.use("/api/internal", internalRouter)          // Cron / service-to-service endpoints

<<<<<<< HEAD


// Mount the Road Health router at /api (the router defines /roads/... and /internal/... internally)
app.use("/api", roadHealthRouter)
=======
// routes import
import authRoutes from './routes/auth.routes.js';
import repairPriorityRouter from "./routes/repair_priority.route.js"

// routes declaration
app.use('/api/auth', authRoutes);
>>>>>>> b4c114c7dc1c2acbfcd831a56dd6225de36d9bd6

// Mount the Repair Priority router at /api
app.use("/api", repairPriorityRouter)

export default app
