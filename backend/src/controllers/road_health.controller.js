import { RoadHealthScore } from "../models/road_health_score.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";

// @desc    List all roads with health_score, optionally filterable
// @route   GET /api/roads/health-scores
export const getAllRoadHealthScores = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // Optional filtering based on authority board rules (red < 50, yellow 50-75, green > 75)
        if (status === "red") {
            query.health_score = { $lt: 50 };
        } else if (status === "yellow") {
            query.health_score = { $gte: 50, $lte: 75 };
        } else if (status === "green") {
            query.health_score = { $gt: 75 };
        }

        const scores = await RoadHealthScore.find(query).sort({ health_score: 1 }); // Lowest first

        return res.status(200).json(new ApiResponse(200, scores, "Road health scores fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching road health scores", [], error.stack)
        );
    }
};

// @desc    Get full factor breakdown for one road segment
// @route   GET /api/roads/health-scores/:segmentId
export const getRoadHealthScoreById = async (req, res) => {
    try {
        const { segmentId } = req.params;

        let query;
        // Check if the segmentId provided is a valid MongoDB ObjectId (if so, query by _id or road_segment_id)
        if (mongoose.Types.ObjectId.isValid(segmentId)) {
            query = { $or: [{ _id: segmentId }, { road_segment_id: segmentId }] };
        } else {
            // Otherwise, fallback to querying by road_name (just in case they pass a string name)
            query = { road_name: segmentId };
        }

        const roadHealth = await RoadHealthScore.findOne(query);

        if (!roadHealth) {
            throw new ApiError(404, "Road health score not found for this segment");
        }

        return res.status(200).json(new ApiResponse(200, roadHealth, "Road health factor breakdown fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching road health breakdown", [], error.stack)
        );
    }
};

// @desc    Internal Cron Job trigger: Recomputes health_score per segment
// @route   POST /api/internal/calculate-health-score
export const calculateHealthScore = async (req, res) => {
    try {
        const { road_segment_id, road_name, factors } = req.body;

        if (!road_segment_id || !road_name || !factors) {
            throw new ApiError(400, "road_segment_id, road_name, and factors are required");
        }

        // Mock calculation algorithm:
        // Base score 100. Subtract points for bad factors.
        let score = 100;
        
        score -= (factors.accident_history * 5); // 5 points per accident
        score -= (factors.potholes * 2); // 2 points per pothole
        score -= (factors.complaints * 1); // 1 point per complaint
        
        if (factors.traffic === "HIGH") score -= 10;
        if (factors.lighting === "POOR") score -= 10;
        if (factors.drainage === "POOR") score -= 10;
        if (factors.road_condition === "POOR") score -= 15;

        // Ensure score stays between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Create or update the RoadHealthScore record
        const updatedHealthScore = await RoadHealthScore.findOneAndUpdate(
            { road_segment_id },
            {
                road_name,
                health_score: score,
                factors,
                last_calculated_at: Date.now()
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedHealthScore, "Health score calculated and updated successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error calculating health score", [], error.stack)
        );
    }
};
