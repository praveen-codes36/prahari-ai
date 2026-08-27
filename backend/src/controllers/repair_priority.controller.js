import { RepairPriority } from "../models/repair_priority.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios";

// @desc    Get all open complaints/segments ranked by priority_score
// @route   GET /api/priority/queue
export const getPriorityQueue = async (req, res) => {
    try {
        // Fetch all priorities, sorted by priority_score descending (highest first)
        const priorityQueue = await RepairPriority.find()
            .sort({ priority_score: -1 })
            .populate("complaint_id") 
            .populate("road_segment_id");

        return res.status(200).json(new ApiResponse(200, priorityQueue, "Priority queue fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching priority queue", [], error.stack)
        );
    }
};

// @desc    Internal Cron Job trigger: Recalculates priority_score
// @route   POST /api/internal/calculate-priority
export const calculatePriorityScore = async (req, res) => {
    try {
        const { complaint_id, road_segment_id, factors } = req.body;

        if (!factors) {
            throw new ApiError(400, "factors are required to calculate priority");
        }

        if (!complaint_id && !road_segment_id) {
            throw new ApiError(400, "Either complaint_id or road_segment_id is required");
        }

        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
        
        const payload = {
            complaint_id: complaint_id || "UNKNOWN",
            defect_type: "Pothole",
            severity: factors.severity || "HIGH",
            road_segment_risk_score: factors.location_risk || 50.0,
            accident_history_count: factors.accident_history || 0,
            traffic_volume_daily: factors.traffic === 'HIGH' ? 35000 : 15000,
            population_density: "Moderate",
            days_open: 3
        };

        const mlRes = await axios.post(`${ML_SERVICE_URL}/calculate_priority`, payload);
        const data = mlRes.data;
        const score = data.priority_score;

        // Define query to either find by complaint_id or road_segment_id
        const query = complaint_id ? { complaint_id } : { road_segment_id };

        // Create or update the Priority record
        const updatedPriority = await RepairPriority.findOneAndUpdate(
            query,
            {
                complaint_id,
                road_segment_id,
                priority_score: score,
                factors,
                computed_at: Date.now()
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedPriority, "Priority score calculated and updated successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error calculating priority score", [], error.stack)
        );
    }
};
