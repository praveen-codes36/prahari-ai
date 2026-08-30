import { TeamMessage } from "../models/team_message.model.js";
import { FieldTeam } from "../models/field_team.model.js";

export const getTeamMessages = async (req, res) => {
  try {
    const messages = await TeamMessage.find({ team_id: req.params.id }).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, data: messages.reverse() });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch team messages.", error: error.message });
  }
};

export const createTeamMessage = async (req, res) => {
  try {
    const team = await FieldTeam.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Field team not found." });
    const { sender, message } = req.body;
    if (!sender || !message?.trim()) return res.status(400).json({ message: "sender and message are required." });
    const created = await TeamMessage.create({ team_id: team._id, sender, message: message.trim() });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send team message.", error: error.message });
  }
};
