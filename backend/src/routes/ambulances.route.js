import { Router } from "express";
import { 
    getNearbyAmbulances, 
    updateAmbulanceLocation 
} from "../controllers/ambulance.controller.js";

const router = Router();

// Route: /api/ambulances
router.route("/")
    .get(getNearbyAmbulances);      // Find nearby available ambulances

// Route: /api/ambulances/:id/location
router.route("/:id/location")
    .patch(updateAmbulanceLocation); // Real-time GPS ping endpoint

export default router;
