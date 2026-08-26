import { RiskZone } from "../models/risk_zone.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Trigger accident risk model to recalculate risk_score for segments
// @route   POST /api/internal/predict-risk
export const predictRisk = async (req, res) => {
    try {
        // In a real scenario, this would call a Python ML microservice to compute the score.
        // For now, we simulate a simple update.
        const riskZones = await RiskZone.find({});
        
        for (let zone of riskZones) {
            // Mocking a risk calculation
            zone.risk_score = Math.floor(Math.random() * 100);
            if (zone.risk_score < 33) zone.risk_level = "LOW";
            else if (zone.risk_score < 66) zone.risk_level = "MEDIUM";
            else zone.risk_level = "HIGH";
            
            zone.last_calculated_at = Date.now();
            await zone.save();
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
