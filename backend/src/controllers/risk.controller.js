import { RiskZone } from "../models/risk_zone.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios";

// @desc    Trigger accident risk model to recalculate risk_score for segments
// @route   POST /api/internal/predict-risk
export const predictRisk = async (req, res) => {
    try {
        const riskZones = await RiskZone.find({});
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

        for (let zone of riskZones) {
            // Get coordinates (if Polygon get first point, if LineString get middle)
            const coords = zone.geometry.coordinates;
            let lng = 81.8463, lat = 25.4358; // Defaults
            if (coords && coords.length > 0) {
                if (zone.geometry.type === "Point") {
                    [lng, lat] = coords;
                } else if (zone.geometry.type === "LineString") {
                    [lng, lat] = coords[Math.floor(coords.length / 2)];
                } else if (zone.geometry.type === "Polygon") {
                    [lng, lat] = coords[0][0];
                }
            }

            const payload = {
                lat,
                lng,
                nearby_defect_count: zone.factors.potholes + zone.factors.streetlights + zone.factors.citizen_complaints
            };

            try {
                const mlRes = await axios.post(`${ML_SERVICE_URL}/predict_risk`, payload);
                const data = mlRes.data;

                if (data && data.risk_score !== undefined) {
                    zone.risk_score = data.risk_score_100 || data.risk_score;
                    zone.risk_level = data.risk_level;
                    zone.last_calculated_at = Date.now();
                    await zone.save();
                }
            } catch (err) {
                console.error(`Failed to update risk for segment ${zone._id}:`, err.message);
            }
        }

        return res.status(200).json(new ApiResponse(200, null, "Risk scores recalculated for all segments"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error recalculating risk scores", [], error.stack)
        );
    }
};

// @desc    Get full risk breakdown for a specific road segment
// @route   GET /api/risk/segment/:id
export const getSegmentRisk = async (req, res) => {
    try {
        const { id } = req.params;
        const segment = await RiskZone.findById(id);

        if (!segment) {
            throw new ApiError(404, "Road segment not found");
        }

        return res.status(200).json(new ApiResponse(200, segment, "Risk breakdown fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching segment risk breakdown", [], error.stack)
        );
    }
};

// @desc    Returns predicted accident-risk zones (red/yellow/green)
// @route   GET /api/map/hotspots
export const getRiskHotspots = async (req, res) => {
    try {
        // Find risk zones with their geometry and risk score
        const hotspots = await RiskZone.find({}).select("geometry risk_score risk_level factors");

        return res.status(200).json(new ApiResponse(200, hotspots, "Risk hotspots retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching risk hotspots", [], error.stack)
        );
    }
};
