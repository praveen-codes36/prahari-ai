import mongoose, { Schema } from "mongoose";
import { HOSPITAL_CAPACITY_STATUS_ENUM } from "../constants.js";

const hospitalSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
            }
        },
        capacity_status: {
            type: String,
            enum: HOSPITAL_CAPACITY_STATUS_ENUM,
            default: "NORMAL"
        }
    },
    {
        timestamps: true
    }
);

// Crucial: 2dsphere index to find the nearest hospital to an accident
hospitalSchema.index({ location: "2dsphere" });

export const Hospital = mongoose.model("Hospital", hospitalSchema);
