import { Router } from "express";
import { getNearbyHospitals } from "../controllers/hospital.controller.js";

const router = Router();

// Route: /api/hospitals
router.route("/")
    .get(getNearbyHospitals); // Find nearby hospitals

export default router;
