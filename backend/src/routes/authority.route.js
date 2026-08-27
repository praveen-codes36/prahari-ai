import { Router } from "express";
import { getOverviewData } from "../controllers/authority.controller.js";

const router = Router();

// Route: /api/authority/overview
router.route("/overview").get(getOverviewData);

export default router;
