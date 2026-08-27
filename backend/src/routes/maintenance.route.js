import { Router } from "express";
import { getPredictions, getPredictionBySegmentId } from "../controllers/maintenance.controller.js";

const router = Router();

// Route: /api/maintenance/predictions
router.route("/predictions").get(getPredictions);

// Route: /api/maintenance/predictions/:segmentId
router.route("/predictions/:segmentId").get(getPredictionBySegmentId);

export default router;
