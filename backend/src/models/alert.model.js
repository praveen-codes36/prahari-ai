import mongoose, { Schema } from "mongoose";

const alertSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['ACCIDENT', 'HIGH_RISK_ZONE', 'BLOCKAGE', 'DEFECT'],
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        is_simulated: {
            type: Boolean,
            default: false // true for hackathon demo data
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
            default: 'ACTIVE'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false }
    }
);

// 2dsphere index for geospatial queries (e.g. finding alerts near a location)
alertSchema.index({ location: "2dsphere" });
// Index for fast querying by active/recent alerts
alertSchema.index({ created_at: -1 });

export const Alert = mongoose.model("Alert", alertSchema);
