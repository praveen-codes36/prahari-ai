import mongoose, { Schema } from "mongoose";

const roadHealthScoreSchema = new Schema({
    road_segment_id: {
        type: Schema.Types.ObjectId,
        ref: "RoadSegment",
        required: true
    },
    road_name: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
    },
    health_score: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    factors: {
        accident_history: {
            type: Number,
            default: 0
        },
        potholes: {
            type: Number,
            default: 0
        },
        traffic: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'LOW'
        },
        lighting: {
            type: String,
            enum: ['POOR', 'AVERAGE', 'GOOD'],
            default: 'GOOD'
        },
        drainage: {
            type: String,
            enum: ['POOR', 'AVERAGE', 'GOOD'],
            default: 'GOOD'
        },
        complaints: {
            type: Number,
            default: 0
        },
        road_condition: {
            type: String,
            enum: ['POOR', 'AVERAGE', 'GOOD'],
            default: 'GOOD'
        }
    },
    last_calculated_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const RoadHealthScore = mongoose.model("RoadHealthScore", roadHealthScoreSchema);
