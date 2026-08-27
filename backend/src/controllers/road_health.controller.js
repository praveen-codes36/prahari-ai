import { RoadHealthScore } from "../models/road_health.model.js";
import { Accident } from "../models/accident.model.js";
import { RoadBlockage } from "../models/road_blockage.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios";

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
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching road health scores", [], error.stack)
        );
    }
};

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
        );
    }
};

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
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
        const payload = {
            road_segment_id: road_segment_id || road_name,
            accident_history_count: nearbyAccidents.length,
            active_potholes: overrides.potholes ?? 0,
            active_streetlight_defects: overrides.lighting ?? 0,
            active_garbage_defects: overrides.complaints ?? 0,
            active_drainage_defects: overrides.drainage ?? 0,
            traffic_volume_daily: 15000,
            lighting_coverage_pct: 85.0,
            drainage_functional: true,
            surface_quality_index: road_condition > 50 ? 5.0 : 8.0
        };

        const mlRes = await axios.post(`${ML_SERVICE_URL}/calculate_health`, payload);
        const data = mlRes.data;
        const health_score = data.health_score;
        const factors = data.factors_breakdown;

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
        );
    }
};
