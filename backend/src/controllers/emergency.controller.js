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

        // We won't throw an error if ambulance is not found.
        // We will just return null for ambulance details and still show the route to the hospital.

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
            accident_location: {
                lat: accLat,
                lng: accLon
            },
            hospital_location: {
                lat: nearestHospital.location.coordinates[1],
                lng: nearestHospital.location.coordinates[0]
            },
            blockages: activeBlockages.map(b => ({
                location: {
                    lat: b.location.coordinates[1],
                    lng: b.location.coordinates[0]
                },
                reason: b.reason || "Unknown Blockage"
            })),
            potholes: defects.map(d => ({
                location: { lat: d.location.coordinates[1], lng: d.location.coordinates[0] },
                severity: d.severity
            })),
            risk_zones: riskZones.map(r => ({
                location: { lat: r.location.coordinates[1], lng: r.location.coordinates[0] },
                risk_score: r.risk_score
            }))
        };

        let routeResult;
        
        try {
            // Calling the Python FastAPI server
            const ROUTING_ENGINE_URL = process.env.ROUTING_ENGINE_URL || "http://127.0.0.1:8000";
            const pythonResponse = await axios.post(`${ROUTING_ENGINE_URL}/route`, routingPayload);
            routeResult = pythonResponse.data;
            
            // Adding nearest ambulance details for the frontend
            routeResult.nearest_ambulance = nearestAmbulance ? {
                id: nearestAmbulance._id,
                vehicle_number: nearestAmbulance.vehicle_number,
                coordinates: nearestAmbulance.current_location.coordinates
            } : null;
            routeResult.nearest_hospital = {
                id: nearestHospital._id,
                name: nearestHospital.name,
                coordinates: nearestHospital.location.coordinates
            };
            
        } catch (microserviceError) {
            console.error("Python routing engine failed:", microserviceError.message);
            throw new ApiError(500, "Routing engine microservice is unreachable. Make sure the FastAPI server is running on port 8000.");
        }

        // 7. Return the final recommended route
        return res.status(200).json(new ApiResponse(200, routeResult, "Emergency route calculated successfully"));

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Error calculating emergency route",
            success: false,
            errors: error.errors || []
        });
    }
};


// @desc    Get aggregated data for the Emergency Response Dashboard summary card
// @route   GET /api/emergency/dashboard/:accidentId
export const getEmergencyDashboardSummary = async (req, res) => {
    try {
        const { accidentId } = req.params;
        const cleanAccidentId = accidentId.trim();

        const accident = await Accident.findById(cleanAccidentId);
        if (!accident) {
            throw new ApiError(404, "Accident not found");
        }

        const accidentLocation = accident.location.coordinates; // [longitude, latitude]

        // MongoDB GeoNear Aggregation for Nearest Ambulance
        const nearestAmbulanceResult = await Ambulance.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: accidentLocation },
                    distanceField: "distance_meters",
                    maxDistance: 20000,
                    query: { status: "AVAILABLE" },
                    spherical: true
                }
            },
            { $limit: 1 }
        ]);

        // MongoDB GeoNear Aggregation for Nearest Hospital
        const nearestHospitalResult = await Hospital.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: accidentLocation },
                    distanceField: "distance_meters",
                    maxDistance: 20000,
                    spherical: true
                }
            },
            { $limit: 1 }
        ]);

        const nearestAmbulance = nearestAmbulanceResult.length > 0 ? nearestAmbulanceResult[0] : null;
        const nearestHospital = nearestHospitalResult.length > 0 ? nearestHospitalResult[0] : null;

        const dashboardData = {
            accident: {
                id: accident._id,
                location: accident.location,
                severity: accident.severity,
                status: accident.status,
                reported_at: accident.createdAt
            },
            nearest_ambulance: nearestAmbulance ? {
                id: nearestAmbulance._id,
                vehicle_number: nearestAmbulance.vehicle_number,
                distance_km: (nearestAmbulance.distance_meters / 1000).toFixed(2),
                coordinates: nearestAmbulance.current_location.coordinates
            } : null,
            nearest_hospital: nearestHospital ? {
                id: nearestHospital._id,
                name: nearestHospital.name,
                distance_km: (nearestHospital.distance_meters / 1000).toFixed(2),
                coordinates: nearestHospital.location.coordinates
            } : null,
            current_traffic_level: "HIGH", // Mocked as per PDF spec
            road_risk_level: "MEDIUM" // Mocked as per PDF spec
        };

        return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard summary fetched successfully"));

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Error fetching dashboard summary",
            success: false,
            errors: error.errors || []
        });
    }
};
