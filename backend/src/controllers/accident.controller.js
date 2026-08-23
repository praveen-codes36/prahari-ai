import { Accident } from "../models/accident.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios"; // Needed for Person 3 integration

// @desc    Report a new accident
// @route   POST /api/accidents
export const reportAccident = async (req, res) => {
    try {
        const { coordinates, severity } = req.body;

        // ==========================================
        // INTEGRATION WITH PERSON 1 (Users/Auth)
        // ==========================================
        // Ideally, `req.user` will be populated by Person 1's Authentication middleware.
        // For testing until Auth is ready, we also check `req.body.reported_by`.
        const reported_by = req.user?._id || req.body.reported_by;

        if (!reported_by) {
            throw new ApiError(400, "User ID is required. (Person 1 Authentication needed)");
        }

        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
            throw new ApiError(400, "Invalid coordinates. Must be an array of [longitude, latitude]");
        }

        const newAccident = await Accident.create({
            reported_by,
            location: {
                type: "Point",
                coordinates
            },
            severity
        });

        // ==========================================
        // INTEGRATION WITH PERSON 3 (ML Services)
        // ==========================================
        // Trigger ML Risk recalculation in the background (fire-and-forget)
        try {
             // Example call to Person 3's Python/Node internal API:
             // axios.post("http://localhost:8000/api/internal/predict-risk", { accident_id: newAccident._id })
             console.log("--> Triggered Person 3 ML Risk recalculation for new accident:", newAccident._id);
        } catch (mlError) {
             console.error("--> Failed to notify ML Service", mlError.message);
        }

        return res.status(201).json(new ApiResponse(201, newAccident, "Accident reported successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error reporting accident", [], error.stack)
        );
    }
};

// @desc    Get active accidents for Emergency Dashboard
// @route   GET /api/accidents
export const getActiveAccidents = async (req, res) => {
    try {
        // Find accidents that are not CLEARED
        const activeAccidents = await Accident.find({ status: { $ne: "CLEARED" } })
            .populate("reported_by", "name email") // Populates Person 1 User data
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, activeAccidents, "Active accidents retrieved"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching accidents", [], error.stack)
        );
    }
};

// @desc    Update accident status (e.g. from REPORTED to RESPONDING or CLEARED)
// @route   PATCH /api/accidents/:id/status
export const updateAccidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
             throw new ApiError(400, "Status is required");
        }

        const accident = await Accident.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!accident) {
             throw new ApiError(404, "Accident not found");
        }

        return res.status(200).json(new ApiResponse(200, accident, "Accident status updated"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error updating accident status", [], error.stack)
        );
    }
};
