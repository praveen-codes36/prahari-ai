import mongoose, { Schema } from "mongoose";

const historicalDataSchema = new Schema(
    {
        road_segment_id: {
            type: Schema.Types.ObjectId,
            ref: "RiskZone",
            required: true
        },
        region_name: {
            type: String,
            trim: true
        },
        // Cached data points
        weather_data: {
            type: Object, // Flexible object to store JSON response from weather APIs
            default: {}
        },
        traffic_density: {
            type: Object, // Flexible object to store traffic density metrics
            default: {}
        },
        government_accident_datasets: {
            type: Object, // Flexible object to store historical accident metadata
            default: {}
        },
        // Valid timeframe for this cache
        cached_at: {
            type: Date,
            default: Date.now
        },
        expires_at: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for fast lookups by segment
historicalDataSchema.index({ road_segment_id: 1 });
// TTL index to automatically expire historical cached data if an expires_at date is set
historicalDataSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const HistoricalData = mongoose.model("HistoricalData", historicalDataSchema);
