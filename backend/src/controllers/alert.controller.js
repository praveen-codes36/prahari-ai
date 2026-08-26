import { Alert } from "../models/alert.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    List currently active alerts
// @route   GET /api/alerts/active
export const getActiveAlerts = async (req, res) => {
    try {
        // Fetch the 50 most recent alerts (in reality, you might filter by timestamp)
        const activeAlerts = await Alert.find({}).sort({ created_at: -1 }).limit(50);

        return res.status(200).json(new ApiResponse(200, activeAlerts, "Active alerts retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching active alerts", [], error.stack)
        );
    }
};
