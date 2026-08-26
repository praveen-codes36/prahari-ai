import { Router } from "express";
import { getSegmentRisk } from "../controllers/risk.controller.js";

const router = Router();

// Route: /api/risk/segment/:id
router.route("/segment/:id").get(getSegmentRisk);

export default router;
