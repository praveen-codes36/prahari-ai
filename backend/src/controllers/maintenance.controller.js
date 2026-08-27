import { MaintenancePrediction } from "../models/maintenance_prediction.model.js";
import { RiskZone } from "../models/risk_zone.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    List all road segments with a predicted 30-day risk increase, sorted by delta
// @route   GET /api/maintenance/predictions
export const getPredictions = async (req, res) => {
    try {
        const predictions = await MaintenancePrediction.find({})
            .populate("road_segment_id")
            .sort({ predicted_risk_score_30d: -1 }); // Sorting by highest predicted risk

        return res.status(200).json(new ApiResponse(200, predictions, "Predictions retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching maintenance predictions", [], error.stack)
        );
    }
};

// @desc    Detailed prediction + reasoning for one segment
// @route   GET /api/maintenance/predictions/:segmentId
export const getPredictionBySegmentId = async (req, res) => {
    try {
        const { segmentId } = req.params;
        const prediction = await MaintenancePrediction.findOne({ road_segment_id: segmentId }).populate("road_segment_id");

        if (!prediction) {
            throw new ApiError(404, "Maintenance prediction for this road segment not found");
        }

        return res.status(200).json(new ApiResponse(200, prediction, "Segment prediction fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching segment prediction", [], error.stack)
        );
    }
};

// @desc    Cron-triggered: runs the trend model over complaint velocity + road condition + traffic history to forecast risk
// @route   POST /api/internal/predict-maintenance
export const predictMaintenance = async (req, res) => {
    try {
        // In a real scenario, this would call the Python ML microservice (Model 5).
        // For now, we simulate a simple update.
        const riskZones = await RiskZone.find({});
        
        for (let zone of riskZones) {
            // Mocking a predictive maintenance calculation
            const current_risk = zone.risk_score || 50;
            const predicted_risk = Math.min(100, current_risk + Math.floor(Math.random() * 20)); // simulated increase

            const reasons = ["increasing complaints", "poor road condition"];
            if (predicted_risk > 80) reasons.push("heavy traffic", "previous accidents");

            await MaintenancePrediction.findOneAndUpdate(
                { road_segment_id: zone._id },
                {
                    current_risk_score: current_risk,
                    predicted_risk_score_30d: predicted_risk,
                    reasoning: reasons,
                    predicted_at: Date.now()
                },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json(new ApiResponse(200, null, "Maintenance predictions generated successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error generating maintenance predictions", [], error.stack)
        );
    }
};
