import { Router } from "express";
import { calculateHealthScore } from "../controllers/road_health.controller.js";
import { predictRisk } from "../controllers/risk.controller.js";
import { predictMaintenance } from "../controllers/maintenance.controller.js";

const router = Router();

// Route: /api/internal/calculate-health-score  (Feature 8 — cron job / closed-loop trigger)
router.route("/calculate-health-score").post(calculateHealthScore);

// Route: /api/internal/predict-risk
router.route("/predict-risk").post(predictRisk);

// Route: /api/internal/predict-maintenance
router.route("/predict-maintenance").post(predictMaintenance);

import { detectDefectInternal, checkDuplicateInternal } from "../controllers/complaints.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Route: /api/internal/detect-defect
router.route("/detect-defect").post(protect, upload.single("photo"), detectDefectInternal);

// Route: /api/internal/check-duplicate
router.route("/check-duplicate").post(protect, checkDuplicateInternal);

export default router;
