import { Router } from "express";
import { getEmergencyRoute, getEmergencyDashboardSummary } from "../controllers/emergency.controller.js";

const router = Router();

// Route: /api/emergency/route
router.route("/route")
    .post(getEmergencyRoute);

// Route: /api/emergency/dashboard/:accidentId
router.route("/dashboard/:accidentId")
    .get(getEmergencyDashboardSummary);

export default router;
