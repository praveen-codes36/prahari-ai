import { Router } from "express";
import { getActiveAlerts } from "../controllers/alert.controller.js";

const router = Router();

// Route: /api/alerts/active
router.route("/active").get(getActiveAlerts);

export default router;
