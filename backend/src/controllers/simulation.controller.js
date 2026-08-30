import { Alert } from "../models/alert.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { Complaint } from "../models/complaint.model.js";
import { RiskZone } from "../models/risk_zone.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { getIo } from "../socket/index.js";
import { haversineDistanceMeters, metersToKm } from "../utils/geo.js";

// Helper to determine corridor name from coords in Prayagraj
function getCorridorName(lat, lng) {
    if (lat > 25.46) return "Phaphamau NH-19 Corridor";
    if (lat < 25.42) return "Naini Industrial Heavy Corridor";
    if (lng > 81.86) return "Shastri Bridge / Jhunsi Arterial";
    return "MG Marg / Civil Lines Corridor";
}

// @desc    Demo utility: manually fires a simulated accident + auto-runs route optimization
// @route   POST /api/simulation/trigger-accident
export const triggerAccidentSimulation = async (req, res) => {
    try {
        const { lng = 81.8463, lat = 25.4358, severity = "HIGH", location_name } = req.body;
        
        const numLng = parseFloat(lng);
        const numLat = parseFloat(lat);

        if (isNaN(numLng) || isNaN(numLat)) {
            throw new ApiError(400, "Valid Longitude (lng) and Latitude (lat) are required");
        }

        const corridor = location_name || getCorridorName(numLat, numLng);

        // 1. Create the alert in the database
        const alert = await Alert.create({
            type: "ACCIDENT",
            location: {
                type: "Point",
                coordinates: [numLng, numLat]
            },
            severity,
            message: `Simulated critical incident detected on ${corridor} (${numLat.toFixed(4)}°N, ${numLng.toFixed(4)}°E)`,
            is_simulated: true
        });

        // 2. Find nearest available ambulance using geospatial or fallback
        let nearestAmbulance = await Ambulance.findOne({
            status: "AVAILABLE",
            current_location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [numLng, numLat] },
                    $maxDistance: 25000
                }
            }
        });

        if (!nearestAmbulance) {
            nearestAmbulance = await Ambulance.findOne({ status: "AVAILABLE" }) || await Ambulance.findOne({});
        }

        // 3. Find nearest hospital
        let nearestHospital = await Hospital.findOne({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [numLng, numLat] },
                    $maxDistance: 25000
                }
            }
        });

        if (!nearestHospital) {
            nearestHospital = await Hospital.findOne({});
        }

        // 4. Calculate distances
        const ambCoords = nearestAmbulance?.current_location?.coordinates || [81.8349, 25.4526];
        const hospCoords = nearestHospital?.location?.coordinates || [81.8549, 25.4326];

        const ambDistKm = parseFloat(metersToKm(haversineDistanceMeters([numLng, numLat], ambCoords)).toFixed(1));
        const hospDistKm = parseFloat(metersToKm(haversineDistanceMeters([numLng, numLat], hospCoords)).toFixed(1));

        // 5. Query local defect & risk metrics
        const defectCount = await Complaint.countDocuments({ status: { $ne: "RESOLVED" } }).limit(25);
        const riskZone = await RiskZone.findOne({});

        // 6. Compute route metrics
        const baselineEta = Math.round(15 + hospDistKm * 2.2);
        const optimizedEta = Math.max(7, Math.round(baselineEta * 0.67));
        const timeSavedMin = baselineEta - optimizedEta;
        const timeSavedPercent = Math.round((timeSavedMin / baselineEta) * 100);

        const optimizationResult = {
            alert_id: alert._id,
            corridor_name: corridor,
            nearest_ambulance: {
                id: nearestAmbulance?._id,
                vehicle_number: nearestAmbulance?.vehicle_number || "EMS-42",
                distance_km: ambDistKm,
                status: "LATCHED_DISPATCH"
            },
            recommended_hospital: {
                id: nearestHospital?._id,
                name: nearestHospital?.name || "Swaroop Rani Nehru (SRN) Hospital",
                distance_km: hospDistKm,
                trauma_bay: "Trauma Bay 02 Armed"
            },
            risk_triage: {
                priority_score: 94,
                severity: severity,
                defects_in_vicinity: defectCount || 8,
                surface_fracture_depth_cm: 16.8
            },
            green_wave_control: {
                synchronized_signals: 9,
                signal_lock_rate: "99.4%",
                green_corridor_window_sec: 90
            },
            corridor_optimization: {
                baseline_eta_mins: baselineEta,
                optimized_eta_mins: optimizedEta,
                time_saved_mins: timeSavedMin,
                time_saved_percent: `${timeSavedPercent}%`,
                latency_reduction: "33.3%",
                smart_latency_ms: 14.2,
                recommended_route: "Route B (Pothole-free Green Wave Bypass)"
            },
            route_optimized: true
        };

        // 7. Safely push live alert over WebSockets if initialized
        try {
            const io = getIo();
            if (io) {
                io.emit("new_alert", {
                    alert,
                    optimization: optimizationResult
                });
            }
        } catch (ioErr) {
            // Non-blocking socket emission
        }

        return res.status(200).json(new ApiResponse(200, { alert, optimizationResult }, "Simulated accident triggered and broadcasted successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error triggering simulation", [], error.stack)
        );
    }
};
