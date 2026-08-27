import { Router } from "express";
import { queryCopilot, explainSegmentRisk } from "../controllers/copilot.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Route: /api/copilot/authority/query
router.route("/authority/query")
    .post(protect, queryCopilot);

// Route: /api/copilot/authority/explain/:roadSegmentId
router.route("/authority/explain/:roadSegmentId")
    .get(protect, explainSegmentRisk);

export default router;
