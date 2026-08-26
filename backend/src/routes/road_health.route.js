import { Router } from "express";
<<<<<<< HEAD
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
=======
import { listRoadHealthScores, getRoadHealthScore } from "../controllers/road_health.controller.js";

const router = Router();

// Route: /api/roads/health-scores
router.route("/health-scores").get(listRoadHealthScores);

// Route: /api/roads/health-scores/:segmentId
router.route("/health-scores/:segmentId").get(getRoadHealthScore);
>>>>>>> a7d5f7d (Loaded the chatbot and wired the backend with chatbot, road health model, emergency routes and other wirings)

export default router;
