import axios from "axios";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Natural-language query for Copilot
// @route   POST /api/copilot/authority/query
export const queryCopilot = async (req, res) => {
    try {
        const { query_text } = req.body;
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

        if (!query_text) {
            throw new ApiError(400, "query_text is required");
        }

        const payload = {
            query: query_text
        };

        const mlRes = await axios.post(`${ML_SERVICE_URL}/copilot/query`, payload);
        const data = mlRes.data;

        return res.status(200).json(new ApiResponse(200, data, "Copilot query executed successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error executing copilot query", [], error.stack)
        );
    }
};

// @desc    Explain risk breakdown for a segment
// @route   GET /api/copilot/authority/explain/:roadSegmentId
export const explainSegmentRisk = async (req, res) => {
    try {
        const { roadSegmentId } = req.params;
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

        // Querying the general copilot explanation capability
        const payload = {
            query: `explain risk for ${roadSegmentId}`
        };

        const mlRes = await axios.post(`${ML_SERVICE_URL}/copilot/query`, payload);
        const data = mlRes.data;

        return res.status(200).json(new ApiResponse(200, data, "Segment explanation executed successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching explanation", [], error.stack)
        );
    }
};
