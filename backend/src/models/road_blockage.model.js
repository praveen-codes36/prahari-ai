import mongoose, { Schema } from "mongoose";

const roadBlockageSchema = new Schema(
    {
        location: {
            type: {
                type: String,
                enum: ['Point', 'LineString', 'Polygon'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [], // Array, can hold [lng, lat] for Point, or nested arrays for LineString
                required: true
            }
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        is_active: {
            type: Boolean,
            default: true
        },
        reported_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true // Will add createdAt and updatedAt automatically
    }
);

// 2dsphere index so the routing engine can query for active blockages along a path
roadBlockageSchema.index({ location: "2dsphere" });

export const RoadBlockage = mongoose.model("RoadBlockage", roadBlockageSchema);
