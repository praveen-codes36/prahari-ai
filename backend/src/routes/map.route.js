import { Router } from "express";
import { getRiskHotspots } from "../controllers/risk.controller.js";

const router = Router();

// Route: /api/map/hotspots
router.route("/hotspots").get(getRiskHotspots);

export default router;
