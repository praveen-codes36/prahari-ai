import { Router } from "express";
import { getEmergencyRoute } from "../controllers/emergency.controller.js";

const router = Router();

// Route: /api/emergency/route
router.route("/route")
    .post(getEmergencyRoute);

export default router;
