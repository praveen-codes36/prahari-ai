import axios from "axios";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Complaint } from "../models/complaint.model.js";

async function getLiveMetrics() {
    try {
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: { $ne: "RESOLVED" } });
        const highSeverity = await Complaint.countDocuments({ severity: { $in: ["HIGH", "CRITICAL"] } });
        
        return `
[REAL-TIME CITY METRICS]
Total Lifetime Reports: ${total}
Active/Pending Road Defects: ${pending}
High/Critical Priority Zones: ${highSeverity}
Average Road Health Index: ${pending > 20 ? 55 : (pending > 10 ? 75 : 92)} / 100
`;
    } catch (e) {
        return "[REAL-TIME DB UNAVAILABLE]";
    }
}

async function generateGeminiCopilotResponse(query) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are the Prahari AI Authority Copilot for Prayagraj Smart City and Municipal Road Operations.
You assist road engineers, municipal commissioners, and traffic authorities with defect priority checks, risk analysis, resource allocation, and emergency planning.

Respond strictly with valid JSON with this schema:
{
  "query": "<user_query>",
  "answer": "<executive strategic answer directly addressing the user's specific query>",
  "grounded_facts": [
    {
      "rank": 1,
      "corridor": "<Road Name>",
      "defect": "<Defect Description>",
      "priority_score": 90,
      "urgency": "<EMERGENCY | HIGH_PRIORITY | MEDIUM>"
    }
  ],
  "recommended_actions": ["<action 1>", "<action 2>"]
}
Do not wrap in markdown or backticks if possible, return raw JSON string.`
        });

        const liveMetrics = await getLiveMetrics();
        const prompt = `[CONTEXT: Live Database Metrics]\n${liveMetrics}\n\n[USER QUERY]\n${query}\n\nINSTRUCTION: Provide a strategic answer that directly addresses the [USER QUERY] above. Do not just summarize the metrics unless asked.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (e) {
        console.warn("Gemini Copilot fallback failed:", e.message);
        return null;
    }
}

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

        try {
            const mlRes = await axios.post(`${ML_SERVICE_URL}/copilot/query`, payload, { timeout: 4000 });
            return res.status(200).json(new ApiResponse(200, mlRes.data, "Copilot query executed successfully"));
        } catch (mlErr) {
            console.warn("ML Service unavailable for copilot query, falling back to Gemini:", mlErr.message);
            const geminiData = await generateGeminiCopilotResponse(query_text);
            if (geminiData) {
                return res.status(200).json(new ApiResponse(200, geminiData, "Copilot query executed successfully via Gemini"));
            }

            throw new ApiError(500, "AI Copilot Service is currently unavailable. Please check the backend services or try again later.");
        }
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

        const payload = {
            query: `explain risk for ${roadSegmentId}`
        };

        try {
            const mlRes = await axios.post(`${ML_SERVICE_URL}/copilot/query`, payload, { timeout: 4000 });
            return res.status(200).json(new ApiResponse(200, mlRes.data, "Segment explanation executed successfully"));
        } catch (mlErr) {
            const geminiData = await generateGeminiCopilotResponse(`explain risk factors and defect score for road segment ${roadSegmentId}`);
            if (geminiData) {
                return res.status(200).json(new ApiResponse(200, geminiData, "Segment explanation executed successfully via Gemini"));
            }

            throw new ApiError(500, "AI Explanation Service is currently unavailable.");
        }
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching explanation", [], error.stack)
        );
    }
};
