import { RepairPriority } from "../models/repair_priority.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Get all open complaints/segments ranked by priority_score
// @route   GET /api/priority/queue
export const getPriorityQueue = async (req, res) => {
    try {
        // Fetch all priorities, sorted by priority_score descending (highest first)
        const priorityQueue = await RepairPriority.find()
            .sort({ priority_score: -1 })
            // If the Complaint model existed, we would populate it here to show full details
            // .populate("complaint_id") 
            // .populate("road_segment_id");
        
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

        // MVP: Hand-tuned weighted formula for Repair Priority
        let score = 0;

        // 1. Severity weight (max 40 points)
        const severityScores = { 'LOW': 10, 'MEDIUM': 20, 'HIGH': 30, 'CRITICAL': 40 };
        score += severityScores[factors.severity || 'LOW'] || 0;

        // 2. Location Risk weight (max 20 points, assumes location_risk is 0-100)
        score += ((factors.location_risk || 0) * 0.2);

        // 3. Accident History (max 20 points, assume 5 points per accident up to 4)
        score += Math.min((factors.accident_history || 0) * 5, 20);

        // 4. Traffic Volume (max 10 points)
        const trafficScores = { 'LOW': 2, 'MEDIUM': 5, 'HIGH': 10 };
        score += trafficScores[factors.traffic || 'LOW'] || 0;

        // 5. Population Usage (max 10 points, arbitrary scale for MVP)
        score += Math.min(((factors.population_usage || 0) / 1000) * 2, 10);

        // Ensure score is clamped between 0 and 100
        score = Math.max(0, Math.min(100, Math.round(score)));

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
