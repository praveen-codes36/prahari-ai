import { Ambulance } from "../models/ambulance.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Find nearby available ambulances
// @route   GET /api/ambulances
export const getNearbyAmbulances = async (req, res) => {
    try {
        // Longitude and latitude should be passed as query parameters (e.g. ?longitude=77.2090&latitude=28.6139)
        const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance default is 10km (in meters)

        if (!longitude || !latitude) {
            throw new ApiError(400, "Longitude and latitude are required to find nearby ambulances");
        }

        // MongoDB Geospatial $near query utilizing the 2dsphere index!
        const ambulances = await Ambulance.find({
            status: "AVAILABLE",
            current_location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).populate("hospital_id", "name capacity_status"); // Pull in the hospital details

        return res.status(200).json(new ApiResponse(200, ambulances, "Nearby available ambulances retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching nearby ambulances", [], error.stack)
        );
    }
};

// @desc    Update ambulance location (Real-time GPS ping)
// @route   PATCH /api/ambulances/:id/location
export const updateAmbulanceLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { longitude, latitude } = req.body;

        if (!longitude || !latitude) {
            throw new ApiError(400, "Longitude and latitude are required in the body");
        }

        const ambulance = await Ambulance.findByIdAndUpdate(
            id,
            {
                current_location: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            { new: true, runValidators: true }
        );

        if (!ambulance) {
            throw new ApiError(404, "Ambulance not found");
        }

        return res.status(200).json(new ApiResponse(200, ambulance, "Ambulance location updated"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error updating ambulance location", [], error.stack)
        );
    }
};
