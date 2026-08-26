import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Complaint } from "../models/Complaint.model.js";
import { Department } from "../models/Department.model.js";


const MAP_DEFECT_TO_DEPARTMENT = {
  POTHOLE: "Road Department",
  BROKEN_STREETLIGHT: "Electrical Department",
  GARBAGE: "Sanitation Department",
  DRAINAGE: "Public Works Department",
  OTHER: "General Civic Department"
};

// ==========================================
// 1. Internal ML Service Call (Proxy to Python)
// ==========================================
export const detectDefectViaML = async (filePath) => {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(ML_SERVICE_URL, formData, {
    headers: formData.getHeaders(),
  });

  // Expected from FastAPI: { defect_type: "POTHOLE", severity: "HIGH", confidence_score: 94 }
  return response.data;
};

// ==========================================
// 2. Internal Duplicate Check Helper
// ==========================================
export const checkDuplicateComplaint = async (longitude, latitude, defectType, maxDistanceMeters = 50) => {
  const nearbyComplaint = await Complaint.findOne({
    defect_type: defectType,
    status: { $ne: "RESOLVED" },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceMeters, // 50 meters radius
      },
    },
  });

  return nearbyComplaint;
};

// ==========================================
// 3. Main Controller: POST /api/complaints
// ==========================================
export const createComplaint = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const photoFile = req.file; // From multer middleware

    if (!photoFile || !longitude || !latitude) {
      return res.status(400).json({ message: "Photo and GPS coordinates are required." });
    }

    // Step A: Call Python FastAPI ML Service
    const mlResult = await detectDefectViaML(photoFile.path);
    const { defect_type, severity, confidence_score } = mlResult;

    // Step B: Automatic Department Assignment
    const deptName = MAP_DEFECT_TO_DEPARTMENT[defect_type] || "General Civic Department";
    const department = await Department.findOne({ name: deptName });

    // Step C: Geo-Radius Duplicate Check (50m radius)
    const existingDuplicate = await checkDuplicateComplaint(
      parseFloat(longitude),
      parseFloat(latitude),
      defect_type
    );

    // Step D: Build & Save Complaint Record
    const newComplaint = await Complaint.create({
      citizen_id: req.user._id,
      photo_url: photoFile.path, // or Cloudinary URL
      defect_type,
      severity,
      confidence_score,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      status: "AI_VERIFIED",
      assigned_department_id: department?._id || null,
      is_duplicate: !!existingDuplicate,
      duplicate_of: existingDuplicate ? existingDuplicate._id : null,
      duplicate_similarity_score: existingDuplicate ? 90 : null,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered and verified by AI.",
      data: newComplaint,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return res.status(500).json({ message: "Failed to process complaint." });
  }
};