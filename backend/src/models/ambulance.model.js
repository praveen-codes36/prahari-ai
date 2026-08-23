import mongoose, { Schema } from "mongoose";
import { AMBULANCE_STATUS_ENUM } from "../constants.js";

const ambulanceSchema = new Schema(
    {
        vehicle_number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        current_location: {
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
        status: {
            type: String,
            enum: AMBULANCE_STATUS_ENUM,
            default: "AVAILABLE"
        },
        hospital_id: {
            type: Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// 2dsphere index is crucial here to find nearby ambulances based on current_location
ambulanceSchema.index({ current_location: "2dsphere" });

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
