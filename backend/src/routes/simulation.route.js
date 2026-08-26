import { Router } from "express";
import { triggerAccidentSimulation } from "../controllers/simulation.controller.js";

const router = Router();

// Route: /api/simulation/trigger-accident
router.route("/trigger-accident").post(triggerAccidentSimulation);

export default router;
