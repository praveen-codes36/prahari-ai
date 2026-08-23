import { Accident } from "../models/accident.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { RoadBlockage } from "../models/road_blockage.model.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import axios from "axios";

// @desc    Core Intelligent Routing Engine Algorithm
// @route   POST /api/emergency/route
export const getEmergencyRoute = async (req, res) => {
    try {
        const { accident_id, longitude, latitude } = req.body;

        if (!accident_id && (!longitude || !latitude)) {
            throw new ApiError(400, "Provide either accident_id or longitude/latitude coordinates");
        }

        let accidentLocation;
        
        // 1. Determine the exact accident location
        if (accident_id) {
            const accident = await Accident.findById(accident_id);
            if (!accident) throw new ApiError(404, "Accident not found");
            accidentLocation = accident.location.coordinates;
        } else {
            accidentLocation = [parseFloat(longitude), parseFloat(latitude)];
        }

        const [accLon, accLat] = accidentLocation;

        // 2. Find nearest available ambulance
        const nearestAmbulance = await Ambulance.findOne({
            status: "AVAILABLE",
            current_location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: 20000 // 20km search radius
                }
            }
        });

        if (!nearestAmbulance) {
            throw new ApiError(404, "No available ambulances found nearby");
        }

        // 3. Find nearest hospital
        const nearestHospital = await Hospital.findOne({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: 20000
                }
            }
        });

        if (!nearestHospital) {
            throw new ApiError(404, "No hospitals found nearby");
        }

        // 4. Gather active Road Blockages (Person 2's specific task)
        const activeBlockages = await RoadBlockage.find({
            is_active: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: 20000
                }
            }
        });

        // ==========================================
        // INTEGRATION WITH PERSON 1 AND PERSON 3
        // ==========================================
        // 5. Gather Infrastructure Defects & Risk Scores
        // You will import Person 1's Complaint model and Person 3's Risk model here once they create them.
        
        let defects = []; // e.g., await Complaint.find({ status: "REPORTED", severity: "HIGH" ... })
        let riskZones = []; // e.g., await RiskZone.find({ risk_score: "HIGH" ... })


        // 6. Send Graph Data to Python Routing Engine Microservice
        const routingPayload = {
            ambulance: {
                id: nearestAmbulance._id,
                coordinates: nearestAmbulance.current_location.coordinates
            },
            accident: {
                coordinates: accidentLocation
            },
            hospital: {
                id: nearestHospital._id,
                coordinates: nearestHospital.location.coordinates
            },
            blockages: activeBlockages.map(b => b.location.coordinates),
            defects: defects,       // Supplied by Person 1
            riskZones: riskZones    // Supplied by Person 3
        };

        let routeResult;
        
        try {
            // Uncomment this when the Python FastAPI server is running
            // const pythonResponse = await axios.post("http://localhost:5000/api/route", routingPayload);
            // routeResult = pythonResponse.data;
            
            // Mocking the Python engine response for now so the API works
            routeResult = {
                fastest_safest_route_coordinates: [
                    nearestAmbulance.current_location.coordinates,
                    accidentLocation,
                    nearestHospital.location.coordinates
                ],
                distance_km: 5.2,
                eta_minutes: 12,
                message: "This is a mocked response until the Python Routing microservice is connected."
            };
        } catch (microserviceError) {
            console.error("Python routing engine failed:", microserviceError.message);
            throw new ApiError(500, "Routing engine microservice is unreachable");
        }

        // 7. Return the final recommended route
        return res.status(200).json(new ApiResponse(200, routeResult, "Emergency route calculated successfully"));

    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error calculating emergency route", [], error.stack)
        );
    }
};
