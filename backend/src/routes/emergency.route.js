import { Router } from "express";
<<<<<<< HEAD
import { getEmergencyDashboardSummary } from "../controllers/emergency.controller.js";
=======
>>>>>>> b4c114c7dc1c2acbfcd831a56dd6225de36d9bd6
import { getEmergencyRoute, getEmergencyDashboard } from "../controllers/emergency.controller.js";

const router = Router();

// Route: /api/emergency/route
router.route("/route").post(getEmergencyRoute);

// Route: /api/emergency/dashboard/:accidentId
router.route("/dashboard/:accidentId").get(getEmergencyDashboard);

export default router;
