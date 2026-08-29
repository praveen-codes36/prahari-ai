import { FieldTeam } from "../models/field_team.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    List all field teams (Maintenance Command Center + Field Team Management pages)
// @route   GET /api/field-teams
export const getAllFieldTeams = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status.toUpperCase();

    const teams = await FieldTeam.find(filter)
      .populate("currentWorkOrderId")
      .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, teams, "Field teams retrieved successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message || "Error fetching field teams", [], error.stack));
  }
};

// @desc    Get one field team
// @route   GET /api/field-teams/:id
export const getFieldTeamById = async (req, res) => {
  try {
    const team = await FieldTeam.findById(req.params.id).populate("currentWorkOrderId");
    if (!team) throw new ApiError(404, "Field team not found");
    return res.status(200).json(new ApiResponse(200, team, "Field team fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message || "Error fetching field team", [], error.stack));
  }
};

// @desc    Create a field team (used to seed squads from the Field Team Management page)
// @route   POST /api/field-teams
export const createFieldTeam = async (req, res) => {
  try {
    const team = await FieldTeam.create(req.body);
    return res.status(201).json(new ApiResponse(201, team, "Field team created successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message || "Error creating field team", [], error.stack));
  }
};

// @desc    Update a field team's live status / location / task (radio + status controls on Field Team Management page)
// @route   PATCH /api/field-teams/:id/status
export const updateFieldTeamStatus = async (req, res) => {
  try {
    const { status, locationName, coordinates, currentTask, etaMin, batteryPct } = req.body;

    const update = {};
    if (status) update.status = status.toUpperCase();
    if (locationName) update.locationName = locationName;
    if (coordinates) update.coordinates = coordinates;
    if (currentTask) update.currentTask = currentTask;
    if (etaMin !== undefined) update.etaMin = etaMin;
    if (batteryPct !== undefined) update.batteryPct = batteryPct;

    // Freeing up a team also clears its active work order reference
    if (status && status.toUpperCase() === "AVAILABLE") {
      update.currentWorkOrderId = null;
      update.currentTask = currentTask || "Standing by";
    }

    const team = await FieldTeam.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!team) throw new ApiError(404, "Field team not found");

    return res.status(200).json(new ApiResponse(200, team, "Field team status updated successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message || "Error updating field team status", [], error.stack));
  }
};
