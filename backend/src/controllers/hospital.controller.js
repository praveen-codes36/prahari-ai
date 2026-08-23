import { Hospital } from "../models/hospital.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    List nearby hospitals
// @route   GET /api/hospitals
export const getNearbyHospitals = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 20000 } = req.query; // maxDistance default 20km

        if (!longitude || !latitude) {
            throw new ApiError(400, "Longitude and latitude are required to find nearby hospitals");
        }

        // MongoDB Geospatial $near query utilizing the 2dsphere index
        const hospitals = await Hospital.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });

        return res.status(200).json(new ApiResponse(200, hospitals, "Nearby hospitals retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching nearby hospitals", [], error.stack)
        );
    }
};
