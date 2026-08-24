import { Router } from "express";
import { 
    getPriorityQueue, 
    calculatePriorityScore 
} from "../controllers/repair_priority.controller.js";

const router = Router();

// ----------------------------------------------------
// Public / Authority Routes
// Prefix will be /api mapped in app.js
// ----------------------------------------------------

// Route: GET /api/priority/queue
router.route("/priority/queue")
    .get(getPriorityQueue);

// ----------------------------------------------------
// Internal / Webhook Routes
// ----------------------------------------------------

// Route: POST /api/internal/calculate-priority
router.route("/internal/calculate-priority")
    .post(calculatePriorityScore);

export default router;
