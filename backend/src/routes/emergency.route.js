import { Router } from "express";
<<<<<<< HEAD
import { getEmergencyRoute, getEmergencyDashboardSummary } from "../controllers/emergency.controller.js";
=======
import { getEmergencyRoute, getEmergencyDashboard } from "../controllers/emergency.controller.js";
>>>>>>> a7d5f7d (Loaded the chatbot and wired the backend with chatbot, road health model, emergency routes and other wirings)

const router = Router();

// Route: /api/emergency/route
router.route("/route").post(getEmergencyRoute);

// Route: /api/emergency/dashboard/:accidentId
router.route("/dashboard/:accidentId").get(getEmergencyDashboard);

// Route: /api/emergency/dashboard/:accidentId
router.route("/dashboard/:accidentId")
    .get(getEmergencyDashboardSummary);

export default router;
