import { Router } from "express";
import { listRoadHealthScores, getRoadHealthScore } from "../controllers/road_health.controller.js";

const router = Router();

// Route: /api/roads/health-scores
router.route("/health-scores").get(listRoadHealthScores);

// Route: /api/roads/health-scores/:segmentId
router.route("/health-scores/:segmentId").get(getRoadHealthScore);

export default router;
