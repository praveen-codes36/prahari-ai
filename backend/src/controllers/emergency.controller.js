import axios from "axios";

import { Accident } from "../models/accident.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { RoadBlockage } from "../models/road_blockage.model.js";
import { Complaint } from "../models/complaint.model.js";
import { RiskZone } from "../models/risk_zone.model.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { haversineDistanceMeters, metersToKm, extractRepresentativePoint } from "../utils/geo.js";

// URL of the Python FastAPI routing-engine service (now integrated in ml-model/server.py)
const ROUTING_ENGINE_URL = process.env.ROUTING_ENGINE_URL || "http://localhost:8000/route";
const NEARBY_SEARCH_RADIUS_METERS = 20000; // 20km

function toLatLng([lng, lat]) {
    return { lat, lng };
}

async function getOptionalOverlays(coordinates) {
    let defects = [];
    let riskZones = [];

    const nearbyComplaints = await Complaint.find({
        status: { $ne: "RESOLVED" },
        location: {
            $near: { $geometry: { type: "Point", coordinates }, $maxDistance: NEARBY_SEARCH_RADIUS_METERS }
        }
    }).limit(50);

    defects = nearbyComplaints.map((c) => ({
        location: toLatLng(c.location.coordinates),
        severity: c.severity
    }));

    const nearbyRisk = await RiskZone.find({}).limit(50);

    riskZones = nearbyRisk
        .map((z) => {
            const point = extractRepresentativePoint(z.geometry);
            return point ? { location: toLatLng(point), risk_score: z.risk_score } : null;
        })
        .filter(Boolean);

    return { defects, riskZones };
}

// @desc    Core Intelligent Routing Engine Algorithm — finds nearest ambulance + hospital,
//          gathers blockages/defects/risk, and asks the Python routing engine for the
//          fastest + safest route.
// @route   POST /api/emergency/route
// @body    { accident_id? } OR { longitude, latitude }
export const getEmergencyRoute = async (req, res) => {
    try {
        const { accident_id, longitude, latitude } = req.body;

        if (!accident_id && (!longitude || !latitude)) {
            throw new ApiError(400, "Provide either accident_id or longitude/latitude coordinates");
        }

        let accidentLocation;

        if (accident_id) {
            const accident = await Accident.findById(accident_id);
            if (!accident) throw new ApiError(404, "Accident not found");
            accidentLocation = accident.location.coordinates;
        } else {
            accidentLocation = [parseFloat(longitude), parseFloat(latitude)];
        }

        const [accLon, accLat] = accidentLocation;

        // 1. Nearest available ambulance
        const nearestAmbulance = await Ambulance.findOne({
            status: "AVAILABLE",
            current_location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });
        if (!nearestAmbulance) throw new ApiError(404, "No available ambulances found nearby");

        // 2. Nearest hospital
        const nearestHospital = await Hospital.findOne({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });
        if (!nearestHospital) throw new ApiError(404, "No hospitals found nearby");

        // 3. Active blockages near the accident
        const activeBlockages = await RoadBlockage.find({
            is_active: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });

        // 4. Defects + risk zones from the other two modules (gracefully empty if not built yet)
        const { defects, riskZones } = await getOptionalOverlays(accidentLocation);

        // 5. Build the payload — shape must match routing-engine/models.py::RouteRequest exactly
        const routingPayload = {
            accident_location: toLatLng(accidentLocation),
            hospital_location: toLatLng(nearestHospital.location.coordinates),
            potholes: defects,
            blockages: activeBlockages
                .map((b) => {
                    const point = extractRepresentativePoint(b.location);
                    return point ? { location: toLatLng(point), reason: b.reason } : null;
                })
                .filter(Boolean),
            risk_zones: riskZones
        };

        // 6. Call the Python FastAPI routing microservice
        let routeResult;
        try {
            const { data } = await axios.post(ROUTING_ENGINE_URL, routingPayload, { timeout: 15000 });
            routeResult = data;
        } catch (microserviceError) {
            console.error("Routing engine call failed:", microserviceError.message);
            // Straight-line fallback so the emergency dashboard never hard-fails if the
            // Python service (or its OSM download) is unavailable during a demo.
            routeResult = {
                recommended_route_type: "fastest",
                fastest_route_coords: [
                    toLatLng(nearestAmbulance.current_location.coordinates),
                    toLatLng(accidentLocation),
                    toLatLng(nearestHospital.location.coordinates)
                ],
                fastest_route_eta_mins: null,
                safest_route_coords: [],
                safest_route_eta_mins: null,
                safest_route_pothole_count: 0,
                safest_route_avg_risk: null,
                fallback: true,
                message: "Routing engine unreachable — showing straight-line fallback route."
            };
        }

        // 7. Mark the ambulance dispatched now that a route has been issued
        if (nearestAmbulance.status === "AVAILABLE") {
            nearestAmbulance.status = "DISPATCHED";
            await nearestAmbulance.save();
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    ambulance: nearestAmbulance,
                    hospital: nearestHospital,
                    active_blockages_considered: activeBlockages.length,
                    route: routeResult
                },
                "Emergency route calculated successfully"
            )
        );
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

        const activeBlockagesNearby = await RoadBlockage.countDocuments({
            is_active: true,
            location: {
                $geoWithin: { $centerSphere: [accidentLocation, 5000 / 6378100] }
            }
        });

        const nearestRiskZone = await RiskZone.findOne({
            geometry: {
                $near: {
                    $geometry: { type: "Point", coordinates: accidentLocation },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });

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
            current_traffic_level: activeBlockagesNearby > 0 ? "HIGH" : "MODERATE",
            road_risk_level: nearestRiskZone ? nearestRiskZone.risk_level : "UNKNOWN"
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

// @desc    Aggregated single call powering the Emergency Operator dashboard's summary card:
//          accident, nearest ambulance + distance, nearest hospital + distance, traffic and
//          road risk level for the area.
// @route   GET /api/emergency/dashboard/:accidentId
export const getEmergencyDashboard = async (req, res) => {
    try {
        const { accidentId } = req.params;

        const accident = await Accident.findById(accidentId).populate("reported_by", "name email");
        if (!accident) throw new ApiError(404, "Accident not found");

        const [accLon, accLat] = accident.location.coordinates;

        const nearestAmbulance = await Ambulance.findOne({
            status: "AVAILABLE",
            current_location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });

        const nearestHospital = await Hospital.findOne({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });

        const activeBlockagesNearby = await RoadBlockage.countDocuments({
            is_active: true,
            location: {
                $geoWithin: { $centerSphere: [[accLon, accLat], 5000 / 6378100] }
            }
        });

        const nearestRiskZone = await RiskZone.findOne({
            geometry: {
                $near: {
                    $geometry: { type: "Point", coordinates: [accLon, accLat] },
                    $maxDistance: NEARBY_SEARCH_RADIUS_METERS
                }
            }
        });

        const traffic_level = activeBlockagesNearby > 0 ? "HIGH" : "MODERATE";
        const road_risk_level = nearestRiskZone ? nearestRiskZone.risk_level : "UNKNOWN";

        const ambulanceDistanceKm = nearestAmbulance
            ? metersToKm(
                  haversineDistanceMeters(accident.location.coordinates, nearestAmbulance.current_location.coordinates)
              )
            : null;

        const hospitalDistanceKm = nearestHospital
            ? metersToKm(haversineDistanceMeters(accident.location.coordinates, nearestHospital.location.coordinates))
            : null;

        const dashboard = {
            accident,
            nearest_ambulance: nearestAmbulance
                ? { ...nearestAmbulance.toObject(), distance_km: ambulanceDistanceKm }
                : null,
            nearest_hospital: nearestHospital
                ? { ...nearestHospital.toObject(), distance_km: hospitalDistanceKm }
                : null,
            active_blockages_nearby: activeBlockagesNearby,
            traffic_level,
            road_risk_level
        };

        return res.status(200).json(new ApiResponse(200, dashboard, "Emergency dashboard snapshot retrieved"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error building emergency dashboard", [], error.stack)
        );
    }
};
