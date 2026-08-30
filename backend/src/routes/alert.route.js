import { Router } from "express";
import { getActiveAlerts, updateAlertStatus, dismissAlert } from "../controllers/alert.controller.js";

const router = Router();

// Route: /api/alerts/active
router.route("/active").get(getActiveAlerts);

// Route: /api/alerts/:id/status
router.route("/:id/status").patch(updateAlertStatus);

// Route: /api/alerts/:id
router.route("/:id").delete(dismissAlert);

export default router;
