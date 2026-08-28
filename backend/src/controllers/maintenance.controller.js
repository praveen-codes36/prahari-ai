import { MaintenancePrediction } from "../models/maintenance_prediction.model.js";
import { RiskZone } from "../models/risk_zone.model.js";
import { RoadHealthScore } from "../models/road_health.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios";

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
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
        
        const healthScores = await RoadHealthScore.find({});
        for (let score of healthScores) {
            const targetId = score.road_segment_id || score._id;
            const payload = {
                road_segment_id: targetId.toString(),
                current_risk_score: score.health_score || 50,
                recent_complaint_velocity: score.factors ? score.factors.complaints || 1.0 : 1.0,
                recent_traffic_trend: 1.0,
                time_since_last_repair_days: 90,
                is_monsoon_season: false,
                road_type: "Major Arterial"
            };

            const mlRes = await axios.post(`${ML_SERVICE_URL}/predict_maintenance`, payload);
            const data = mlRes.data;

            await MaintenancePrediction.findOneAndUpdate(
                { road_segment_id: targetId },
                {
                    current_risk_score: data.current_risk_score,
                    predicted_risk_score_30d: data.predicted_risk_score_30d,
                    reasoning: data.reasoning,
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
