import mongoose, { Schema } from "mongoose";
import { ACCIDENT_STATUS_ENUM, SEVERITY_ENUM } from "../constants.js";

const accidentSchema = new Schema(
    {
        reported_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
                type: [Number], // Array of numbers: [longitude, latitude]
                required: true
            },
            address: {
                type: String,
                default: ""
            }
        },
        severity: {
            type: String,
            enum: SEVERITY_ENUM,
            required: true
        },
        status: {
            type: String,
            enum: ACCIDENT_STATUS_ENUM,
            default: "REPORTED"
        }
    },
    {
        timestamps: true
    }
);

// Crucial: 2dsphere index for location-based MongoDB geospatial queries
accidentSchema.index({ location: "2dsphere" });

export const Accident = mongoose.model("Accident", accidentSchema);
