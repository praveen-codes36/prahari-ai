import { Router } from "express";
import {
  getAllFieldTeams,
  getFieldTeamById,
  createFieldTeam,
  updateFieldTeamStatus,
  getCurrentTeamWorkOrder,
} from "../controllers/field_team.controller.js";
import { getTeamMessages, createTeamMessage } from "../controllers/team_message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(protect, getAllFieldTeams).post(protect, createFieldTeam);
router.get("/:id/current-work-order", protect, getCurrentTeamWorkOrder);
router.get("/:id/messages", protect, getTeamMessages);
router.post("/:id/messages", protect, createTeamMessage);
router.route("/:id/status").patch(protect, updateFieldTeamStatus);
router.route("/:id").get(protect, getFieldTeamById);

export default router;
