import { Router } from "express";
import { reportBlockage, getActiveBlockages } from "../controllers/road_blockage.controller.js";

const router = Router();

// Route: /api/blockages
router.route("/")
    .post(reportBlockage)       // Report a temporary road closure
    .get(getActiveBlockages);   // Fetch active blockages for map layers

export default router;
