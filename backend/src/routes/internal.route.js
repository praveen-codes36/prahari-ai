import { Router } from "express";
import { calculateHealthScore } from "../controllers/road_health.controller.js";

const router = Router();

// Route: /api/internal/calculate-health-score  (Feature 8 — cron job / closed-loop trigger)
router.route("/calculate-health-score").post(calculateHealthScore);

// Other /api/internal/* routes from the spec (detect-defect, predict-risk, calculate-priority,
// trigger-recalculation, predict-maintenance, ...) belong to Person 1 / Person 3's modules.
// Mount their routers here as those land, e.g.:
//   import { detectDefect } from "../controllers/complaint.controller.js";
//   router.route("/detect-defect").post(detectDefect);

export default router;
