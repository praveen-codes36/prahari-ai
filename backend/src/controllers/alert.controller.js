import { Alert } from "../models/alert.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    List currently active alerts with optional filters
// @route   GET /api/alerts/active
export const getActiveAlerts = async (req, res) => {
    try {
        const { type, severity, status, is_simulated } = req.query;
        const filter = {};

        if (type && type !== 'ALL') {
            filter.type = type.toUpperCase();
        }
        if (severity && severity !== 'ALL') {
            filter.severity = severity.toUpperCase();
        }
        if (status && status !== 'ALL') {
            filter.status = status.toUpperCase();
        }
        if (is_simulated !== undefined) {
            filter.is_simulated = is_simulated === 'true';
        }

        const activeAlerts = await Alert.find(filter).sort({ created_at: -1 }).limit(100);

        return res.status(200).json(new ApiResponse(200, activeAlerts, "Active alerts retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching active alerts", [], error.stack)
        );
    }
};

// @desc    Update alert status (e.g. ACKNOWLEDGED, RESOLVED, ACTIVE)
// @route   PATCH /api/alerts/:id/status
export const updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status = "ACKNOWLEDGED" } = req.body;

        const alert = await Alert.findByIdAndUpdate(
            id,
            { status: status.toUpperCase() },
            { new: true }
        );

        if (!alert) {
            throw new ApiError(404, "Alert not found");
        }

        return res.status(200).json(new ApiResponse(200, alert, `Alert status updated to ${status}`));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error updating alert status", [], error.stack)
        );
    }
};

// @desc    Dismiss / delete an alert
// @route   DELETE /api/alerts/:id
export const dismissAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findByIdAndDelete(id);

        if (!alert) {
            throw new ApiError(404, "Alert not found");
        }

        return res.status(200).json(new ApiResponse(200, { id }, "Alert dismissed successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error dismissing alert", [], error.stack)
        );
    }
};
