import { Router } from "express";
import { getOverviewData } from "../controllers/authority.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Route: /api/authority/overview
router.route("/overview").get(protect, authorizeRoles("AUTHORITY"), getOverviewData);

export default router;
