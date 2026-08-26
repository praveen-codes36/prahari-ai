<<<<<<< HEAD
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
=======
import { RoadHealthScore } from "../models/road_health.model.js";
import { Accident } from "../models/accident.model.js";
import { RoadBlockage } from "../models/road_blockage.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// How much each factor drags the health score down. Sum of weights = 1.
const WEIGHTS = {
    accident_history: 0.25,
    potholes: 0.2,
    traffic: 0.15,
    lighting: 0.1,
    drainage: 0.1,
    complaints: 0.15,
    road_condition: 0.05
};

function scoreBand(health_score) {
    if (health_score < 50) return "RED";
    if (health_score <= 75) return "YELLOW";
    return "GREEN";
}

// @desc    List all roads with health_score, sortable/filterable (authority board: red < 50, yellow 50-75, green > 75)
// @route   GET /api/roads/health-scores
// @query   band=RED|YELLOW|GREEN, sort=asc|desc (by health_score, default asc so worst roads surface first)
export const listRoadHealthScores = async (req, res) => {
    try {
        const { band, sort = "asc" } = req.query;

        let scores = await RoadHealthScore.find().sort({ health_score: sort === "desc" ? -1 : 1 });

        const withBand = scores.map((s) => ({ ...s.toObject(), band: scoreBand(s.health_score) }));

        const filtered = band
            ? withBand.filter((s) => s.band === band.toUpperCase())
            : withBand;

        return res
            .status(200)
            .json(new ApiResponse(200, filtered, "Road health scores retrieved successfully"));
>>>>>>> a7d5f7d (Loaded the chatbot and wired the backend with chatbot, road health model, emergency routes and other wirings)
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching road health scores", [], error.stack)
        );
    }
};

<<<<<<< HEAD
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
=======
// @desc    Full factor breakdown for one road
// @route   GET /api/roads/health-scores/:segmentId
export const getRoadHealthScore = async (req, res) => {
    try {
        const { segmentId } = req.params;

        const score = await RoadHealthScore.findOne({
            $or: [{ _id: segmentId }, { road_segment_id: segmentId }]
        });

        if (!score) throw new ApiError(404, "No health score found for this road segment");

        return res.status(200).json(
            new ApiResponse(
                200,
                { ...score.toObject(), band: scoreBand(score.health_score) },
                "Road health score retrieved"
            )
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching road health score", [], error.stack)
>>>>>>> a7d5f7d (Loaded the chatbot and wired the backend with chatbot, road health model, emergency routes and other wirings)
        );
    }
};

<<<<<<< HEAD
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
=======
// @desc    Recompute (or create) the health score for one road segment
// @route   POST /api/internal/calculate-health-score
// @body    { road_segment_id?, road_name, coordinates: [lng, lat], radius_meters?, overrides?: {...factors} }
// Cron-triggered in production; also fired by the Feature 10 closed-loop hook whenever a
// complaint/accident changes near this road.
export const calculateHealthScore = async (req, res) => {
    try {
        const { road_segment_id, road_name, coordinates, radius_meters = 500, overrides = {} } = req.body;

        if (!road_name || !coordinates) {
            throw new ApiError(400, "road_name and coordinates ([longitude, latitude]) are required");
        }

        // Accident count near this segment is used as the accident_history factor (0-100, capped).
        const nearbyAccidents = await Accident.find({
            location: {
                $near: { $geometry: { type: "Point", coordinates }, $maxDistance: radius_meters }
            }
        });
        const accident_history = Math.min(100, nearbyAccidents.length * 15);

        // Active blockages near this segment stand in for road_condition until Person 1's
        // Complaint model (pothole/drainage/lighting counts) is wired in below.
        const nearbyBlockages = await RoadBlockage.find({
            is_active: true,
            location: {
                $near: { $geometry: { type: "Point", coordinates }, $maxDistance: radius_meters }
            }
        });
        const road_condition = Math.min(100, nearbyBlockages.length * 20);

        // TODO(integration): once Person 1's Complaint model exists, replace these overrides with real counts:
        //   potholes   <- Complaint.countDocuments({ defect_type: "POTHOLE", status: { $ne: "RESOLVED" }, location near })
        //   lighting   <- Complaint.countDocuments({ defect_type: "BROKEN_STREETLIGHT", ... })
        //   drainage   <- Complaint.countDocuments({ defect_type: "DRAINAGE", ... })
        //   complaints <- total open Complaint count near this segment
        //   traffic    <- Person 3's HistoricalData / live traffic feed
        const factors = {
            accident_history,
            potholes: overrides.potholes ?? 0,
            traffic: overrides.traffic ?? 0,
            lighting: overrides.lighting ?? 0,
            drainage: overrides.drainage ?? 0,
            complaints: overrides.complaints ?? 0,
            road_condition
        };

        // Each factor is a 0-100 "badness" score; health_score is the inverse of their weighted sum.
        const badness = Object.entries(WEIGHTS).reduce(
            (sum, [key, weight]) => sum + (factors[key] || 0) * weight,
            0
        );
        const health_score = Math.max(0, Math.round(100 - badness));

        const updated = await RoadHealthScore.findOneAndUpdate(
            road_segment_id ? { road_segment_id } : { road_name },
            { road_segment_id, road_name, health_score, factors, last_calculated_at: new Date() },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                { ...updated.toObject(), band: scoreBand(health_score) },
                "Road health score recalculated"
            )
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error calculating road health score", [], error.stack)
>>>>>>> a7d5f7d (Loaded the chatbot and wired the backend with chatbot, road health model, emergency routes and other wirings)
        );
    }
};
