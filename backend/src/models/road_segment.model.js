import mongoose, { Schema } from "mongoose";

const roadSegmentSchema = new Schema({
    road_name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point', 'LineString'],
            default: 'LineString'
        },
        coordinates: {
            type: [],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['GOOD', 'FAIR', 'POOR', 'CRITICAL'],
        default: 'GOOD'
    }
}, { timestamps: true });

export const RoadSegment = mongoose.model("RoadSegment", roadSegmentSchema);
