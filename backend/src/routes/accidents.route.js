import { Router } from "express";
import { 
    reportAccident, 
    getActiveAccidents, 
    updateAccidentStatus 
} from "../controllers/accident.controller.js";

const router = Router();

// Route: /api/accidents
router.route("/")
    .post(reportAccident)      // Citizen/Authority reports an accident
    .get(getActiveAccidents);  // Emergency dashboard fetches active accidents

// Route: /api/accidents/:id/status
router.route("/:id/status")
    .patch(updateAccidentStatus); // Update accident status (e.g. CLEARED)

export default router;
