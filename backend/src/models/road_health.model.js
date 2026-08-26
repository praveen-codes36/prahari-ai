import mongoose, { Schema } from "mongoose";

const roadHealthScoreSchema = new Schema(
    {
        // Will ref Person 3's RoadSegment/RiskZone model once it exists. Kept optional (not `required`)
        // so this module works standalone until that schema lands — we key on road_name in the meantime.
        road_segment_id: {
            type: Schema.Types.ObjectId,
            ref: "RoadSegment",
            default: null
        },
        road_name: {
            type: String,
            required: true,
            trim: true
        },
        health_score: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        factors: {
            accident_history: { type: Number, default: 0 },
            potholes: { type: Number, default: 0 },
            traffic: { type: Number, default: 0 },
            lighting: { type: Number, default: 0 },
            drainage: { type: Number, default: 0 },
            complaints: { type: Number, default: 0 },
            road_condition: { type: Number, default: 0 }
        },
        last_calculated_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export const RoadHealthScore = mongoose.model("RoadHealthScore", roadHealthScoreSchema);
