import { Router } from "express";
import { getDepartments } from "../controllers/complaints.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Route: /api/departments
router.route("/").get(protect, getDepartments);

export default router;
