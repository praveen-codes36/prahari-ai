import { Ambulance } from "../models/ambulance.model.js";
import { Hospital } from "../models/hospital.model.js";
import { RoadBlockage } from "../models/road_blockage.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

// @desc    Get active defects for map layer
// @route   GET /api/map/defects
export const getDefectsLayer = async (req, res) => {
    try {
        let defects = [];
        try {
            // Attempt to load Complaint model dynamically
            const { Complaint } = await import("../models/complaint.model.js");
            // Only return complaints that are not resolved
            const openComplaints = await Complaint.find({ status: { $ne: "RESOLVED" } })
                                                 .select("location defect_type severity status photo_url confidence_score assigned_department_id createdAt updatedAt")
                                                 .populate("assigned_department_id", "name");
            defects = openComplaints;
        } catch (e) {
            // Complaint model not built yet; gracefully fallback
            console.log("Complaint model not found; returning empty defects layer");
        }

        return res.status(200).json(new ApiResponse(200, defects, "Defects layer retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching defects layer", [], error.stack)
        );
    }
};

// @desc    Get current/simulated congestion
// @route   GET /api/map/traffic
export const getTrafficLayer = async (req, res) => {
    try {
        // Traffic might be simulated or pulled from a 3rd party API (e.g. Mapbox/TomTom)
        // For MVP, we can simulate some heavy traffic around active road blockages
        const blockages = await RoadBlockage.find({ is_active: true });
        
        // Mocking traffic data around blockages
        const trafficData = blockages.map(b => ({
            location: b.location,
            congestion_level: "HIGH"
        }));

        return res.status(200).json(new ApiResponse(200, trafficData, "Traffic layer retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching traffic layer", [], error.stack)
        );
    }
};

// @desc    Get live ambulance positions
// @route   GET /api/map/ambulances
export const getAmbulancesLayer = async (req, res) => {
    try {
        const ambulances = await Ambulance.find({}).select("current_location status vehicle_number hospital_id");
        return res.status(200).json(new ApiResponse(200, ambulances, "Ambulances layer retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching ambulances layer", [], error.stack)
        );
    }
};

// @desc    Get hospitals with capacity
// @route   GET /api/map/hospitals
export const getHospitalsLayer = async (req, res) => {
    try {
        const hospitals = await Hospital.find({}).select("location name capacity_status");
        return res.status(200).json(new ApiResponse(200, hospitals, "Hospitals layer retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching hospitals layer", [], error.stack)
        );
    }
};

// @desc    Get active road blockages
// @route   GET /api/map/blockages
export const getBlockagesLayer = async (req, res) => {
    try {
        const blockages = await RoadBlockage.find({ is_active: true }).select("location reason reported_at");
        return res.status(200).json(new ApiResponse(200, blockages, "Blockages layer retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching blockages layer", [], error.stack)
        );
    }
};

// @desc    Returns available toggleable layers for UI based on user role
// @route   GET /api/map/layers
export const getLayersConfig = async (req, res) => {
    try {
        // Ideally req.user.role would dictate this, but for now we provide the full list
        const layers = [
            { id: "hotspots", name: "Accident Hotspots", enabled: true, color: "red" },
            { id: "defects", name: "Road Defects", enabled: true, color: "orange" },
            { id: "traffic", name: "Live Traffic", enabled: true, color: "yellow" },
            { id: "ambulances", name: "Ambulances", enabled: true, color: "blue" },
            { id: "hospitals", name: "Hospitals", enabled: true, color: "green" },
            { id: "blockages", name: "Road Blockages", enabled: true, color: "black" }
        ];

        return res.status(200).json(new ApiResponse(200, layers, "Layers config retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Error fetching layers config", [], error.stack)
        );
    }
};
