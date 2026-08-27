import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { predictRisk } from "./risk.controller.js";
import { calculateHealthScore } from "./road_health.controller.js";
import { calculatePriorityScore } from "./repair_priority.controller.js";
import { predictMaintenance } from "./maintenance.controller.js";

// Helper function to mock Express 'res' object for internal controller calls
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

// @desc    Internal event hook fired after: complaint created/resolved, defect status change, or new accident.
//          Cascades to /predict-risk, /calculate-health-score and /calculate-priority
// @route   POST /api/internal/trigger-recalculation
export const triggerRecalculation = async (req, res) => {
    try {
        const steps_completed = [];
        const errors = [];

        // 1. Recalculate Accident Risk
        const riskRes = mockResponse();
        await predictRisk(req, riskRes);
        if (riskRes.statusCode === 200) steps_completed.push("Accident Risk Recalculated");
        else errors.push("Failed to recalculate accident risk");

        // 2. Recalculate Road Health Score (Requires road_name and coordinates in req.body)
        if (req.body.road_name && req.body.coordinates) {
            const healthRes = mockResponse();
            await calculateHealthScore(req, healthRes);
            if (healthRes.statusCode === 200) steps_completed.push("Road Health Score Updated");
            else errors.push("Failed to update road health score");
        } else {
            steps_completed.push("Road Health Score Skipped (Missing road_name/coordinates)");
        }

        // 3. Recalculate Repair Priority Queue (Requires factors and an ID)
        if (req.body.factors && (req.body.complaint_id || req.body.road_segment_id)) {
            const priorityRes = mockResponse();
            await calculatePriorityScore(req, priorityRes);
            if (priorityRes.statusCode === 200) steps_completed.push("Repair Priority Re-ranked");
            else errors.push("Failed to update repair priority");
        } else {
            steps_completed.push("Repair Priority Skipped (Missing factors/IDs)");
        }

        // 4. Run Predictive Maintenance Trend Updates
        const maintRes = mockResponse();
        await predictMaintenance(req, maintRes);
        if (maintRes.statusCode === 200) steps_completed.push("Predictive Maintenance Updated");
        
        const orchestrationResult = {
            trigger_event: req.body.event_type || "manual_trigger",
            steps_completed,
            errors,
            timestamp: new Date()
        };
        
        return res.status(200).json(new ApiResponse(200, orchestrationResult, "Closed-Loop system triggered. Modules synchronized."));
    } catch (error) {
         return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error triggering recalculation loop", [], error.stack)
        );
    }
};
