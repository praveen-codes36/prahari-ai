import { Router } from "express";
import { calculateHealthScore } from "../controllers/road_health.controller.js";
import { predictRisk } from "../controllers/risk.controller.js";

const router = Router();

// Route: /api/internal/calculate-health-score  (Feature 8 — cron job / closed-loop trigger)
router.route("/calculate-health-score").post(calculateHealthScore);

// Route: /api/internal/predict-risk
router.route("/predict-risk").post(predictRisk);

// Other /api/internal/* routes from the spec (detect-defect, calculate-priority,
// trigger-recalculation, predict-maintenance, ...) belong to Person 1 / Person 3's modules.

export default router;
