import { Alert } from "../models/alert.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { getIo } from "../socket/index.js";

// @desc    Demo utility: manually fires a simulated accident + auto-runs route optimization
// @route   POST /api/simulation/trigger-accident
export const triggerAccidentSimulation = async (req, res) => {
    try {
        const { lng, lat, severity = "HIGH" } = req.body;
        
        if (!lng || !lat) {
            throw new ApiError(400, "Longitude (lng) and Latitude (lat) are required");
        }

        // 1. Create the alert in the database
        const alert = await Alert.create({
            type: "ACCIDENT",
            location: {
                type: "Point",
                coordinates: [lng, lat]
            },
            severity,
            message: `Accident detected at ${lat}, ${lng}`,
            is_simulated: true
        });

        // 2. Find a mock nearest ambulance and hospital
        const ambulance = await Ambulance.findOne({ status: "AVAILABLE" });
        const hospital = await Hospital.findOne({});

        const optimizationResult = {
            alert_id: alert._id,
            nearest_ambulance: ambulance ? ambulance.vehicle_number : "Unknown",
            recommended_hospital: hospital ? hospital.name : "Unknown",
            eta: "7 min",
            route_optimized: true
        };

        // 3. Push live alert over WebSockets
        const io = getIo();
        io.emit("new_alert", {
            alert,
            optimization: optimizationResult
        });

        return res.status(200).json(new ApiResponse(200, { alert, optimizationResult }, "Simulated accident triggered and broadcasted successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error triggering simulation", [], error.stack)
        );
    }
};
