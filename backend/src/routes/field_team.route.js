import { Router } from "express";
import {
  getAllFieldTeams,
  getFieldTeamById,
  createFieldTeam,
  updateFieldTeamStatus,
} from "../controllers/field_team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/field-teams  (?status=AVAILABLE to filter)
router.route("/").get(protect, getAllFieldTeams).post(protect, createFieldTeam);

// GET /api/field-teams/:id
router.route("/:id").get(protect, getFieldTeamById);

// PATCH /api/field-teams/:id/status
router.route("/:id/status").patch(protect, updateFieldTeamStatus);

export default router;
