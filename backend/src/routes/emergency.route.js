import { Router } from "express";
import { getEmergencyRoute, getEmergencyDashboard } from "../controllers/emergency.controller.js";

const router = Router();

// Route: /api/emergency/route
router.route("/route").post(getEmergencyRoute);

// Route: /api/emergency/dashboard/:accidentId
router.route("/dashboard/:accidentId").get(getEmergencyDashboard);

export default router;
