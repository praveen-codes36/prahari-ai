import { Router } from "express";
import { 
    getAllRoadHealthScores, 
    getRoadHealthScoreById, 
    calculateHealthScore 
} from "../controllers/road_health.controller.js";

const router = Router();

// ----------------------------------------------------
// Public / Authority Routes
// Prefix will be /api mapped in app.js
// ----------------------------------------------------

// Route: GET /api/roads/health-scores
router.route("/roads/health-scores")
    .get(getAllRoadHealthScores);

// Route: GET /api/roads/health-scores/:segmentId
router.route("/roads/health-scores/:segmentId")
    .get(getRoadHealthScoreById);

// ----------------------------------------------------
// Internal / Webhook Routes
// ----------------------------------------------------

// Route: POST /api/internal/calculate-health-score
router.route("/internal/calculate-health-score")
    .post(calculateHealthScore);

export default router;
