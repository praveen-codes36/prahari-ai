import mongoose, { Schema } from "mongoose";

const repairPrioritySchema = new Schema({
    complaint_id: {
        type: Schema.Types.ObjectId,
        ref: "Complaint",
        // Can be null if the priority is assigned to a whole road segment instead of a specific complaint
    },
    road_segment_id: {
        type: Schema.Types.ObjectId,
        ref: "RoadSegment",
        // Can be null if the priority is assigned to a specific standalone complaint
    },
    priority_score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
        index: true // Indexed because we will sort by this for the Queue
    },
    rank: {
        type: Number,
        // Optional: Can be updated dynamically to represent the absolute position in the queue (e.g. 1st, 2nd, 3rd)
    },
    factors: {
        severity: { 
            type: String, 
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
        },
        location_risk: { 
            type: Number,
            min: 0,
            max: 100
        },
        accident_history: { 
            type: Number,
            default: 0
        },
        traffic: { 
            type: String, 
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'LOW'
        },
        population_usage: { 
            type: Number,
            default: 0
        }
    },
    computed_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const RepairPriority = mongoose.model("RepairPriority", repairPrioritySchema);
