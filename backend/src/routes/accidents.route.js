import { Router } from "express";
import { 
    reportAccident, 
    getActiveAccidents, 
    updateAccidentStatus 
} from "../controllers/accident.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Route: /api/accidents
router.route("/")
    .post(protect, reportAccident)      // Citizen/Authority reports an accident
    .get(getActiveAccidents);  // Emergency dashboard fetches active accidents

// Route: /api/accidents/:id/status
router.route("/:id/status")
    .patch(protect, updateAccidentStatus); // Update accident status (e.g. CLEARED)

export default router;
