import { RoadBlockage } from "../models/road_blockage.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Report a temporary road closure / blockage
// @route   POST /api/blockages
export const reportBlockage = async (req, res) => {
    try {
        // Location should be a GeoJSON object containing 'type' and 'coordinates'.
        // Example: { type: "Point", coordinates: [77.123, 28.456] }
        // or { type: "LineString", coordinates: [[77.1, 28.4], [77.2, 28.5]] }
        const { location, reason } = req.body;

        if (!location || !location.type || !location.coordinates) {
            throw new ApiError(400, "Valid GeoJSON location object is required (must contain 'type' and 'coordinates')");
        }

        if (!reason) {
            throw new ApiError(400, "Reason for the road blockage is required");
        }

        const newBlockage = await RoadBlockage.create({
            location,
            reason,
            is_active: true
        });

        return res.status(201).json(new ApiResponse(201, newBlockage, "Road blockage reported successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error reporting road blockage", [], error.stack)
        );
    }
};

// @desc    Fetch active blockages for map layers
// @route   GET /api/blockages
export const getActiveBlockages = async (req, res) => {
    try {
        const activeBlockages = await RoadBlockage.find({ is_active: true }).sort({ reported_at: -1 });

        return res.status(200).json(new ApiResponse(200, activeBlockages, "Active road blockages retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching active road blockages", [], error.stack)
        );
    }
};
