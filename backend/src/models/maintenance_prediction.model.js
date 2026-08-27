import mongoose, { Schema } from "mongoose";

const maintenancePredictionSchema = new Schema(
    {
        road_segment_id: {
            type: Schema.Types.ObjectId,
            ref: "RiskZone", // Assuming RoadSegment is stored as RiskZone based on other models
            required: true,
        },
        current_risk_score: {
            type: Number,
            required: true,
        },
        predicted_risk_score_30d: {
            type: Number,
            required: true,
        },
        estimated_preventive_cost: {
            type: Number,
            default: 150000,
        },
        estimated_catastrophic_cost: {
            type: Number,
            default: 2500000,
        },
        recommended_intervention_days: {
            type: Number,
            default: 15,
        },
        reasoning: {
            type: [String],
            required: true,
        },
        predicted_at: {
            type: Date,
            default: Date.now,
        }
    }
);

export const MaintenancePrediction = mongoose.model("MaintenancePrediction", maintenancePredictionSchema);
