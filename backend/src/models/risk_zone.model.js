import mongoose, { Schema } from "mongoose";

const riskZoneSchema = new Schema(
    {
        geometry: {
            type: {
                type: String,
                enum: ['LineString', 'Polygon'],
                required: true,
            },
            coordinates: {
                type: [], // Array of numbers/arrays depending on LineString or Polygon
                required: true
            }
        },
        risk_score: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            default: 0
        },
        risk_level: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            required: true,
            default: 'LOW'
        },
        factors: {
            accident_history: { type: Number, default: 0 },
            traffic: { type: Number, default: 0 },
            weather: { type: Number, default: 0 },
            road_condition: { type: Number, default: 0 },
            potholes: { type: Number, default: 0 },
            streetlights: { type: Number, default: 0 },
            time_of_day: { type: Number, default: 0 },
            day_of_week: { type: Number, default: 0 },
            citizen_complaints: { type: Number, default: 0 }
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

// Crucial: 2dsphere index for geospatial queries (e.g. finding hotspots near a location)
riskZoneSchema.index({ geometry: "2dsphere" });
// Index for fast querying by risk level or score
riskZoneSchema.index({ risk_level: 1, risk_score: -1 });

export const RiskZone = mongoose.model("RiskZone", riskZoneSchema);
