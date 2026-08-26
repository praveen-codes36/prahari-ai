import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Complaint } from "../models/complaint.model.js";
import { Department } from "../models/Department.model.js";

const MAP_DEFECT_TO_DEPARTMENT = {
  POTHOLE: "Road Department",
  BROKEN_STREETLIGHT: "Electrical Department",
  GARBAGE: "Sanitation Department",
  DRAINAGE: "Public Works Department",
  OTHER: "General Civic Department"
};

// ==========================================
// INTERNAL HELPERS
// ==========================================
export const detectDefectViaML = async (filePath) => {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  const response = await axios.post(ML_SERVICE_URL, formData, { headers: formData.getHeaders() });
  return response.data;
};

export const checkDuplicateHelper = async (longitude, latitude, defectType, maxDistanceMeters = 50) => {
  return await Complaint.findOne({
    defect_type: defectType,
    status: { $ne: "RESOLVED" },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistanceMeters,
      },
    },
  });
};

// ==========================================
// CORE ENDPOINTS
// ==========================================

// POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const photoFile = req.file;

    if (!photoFile || !longitude || !latitude) return res.status(400).json({ message: "Photo and GPS required." });

    const mlResult = await detectDefectViaML(photoFile.path);
    const { defect_type, severity, confidence_score } = mlResult;

    const deptName = MAP_DEFECT_TO_DEPARTMENT[defect_type] || "General Civic Department";
    const department = await Department.findOne({ name: deptName });

    const existingDuplicate = await checkDuplicateHelper(parseFloat(longitude), parseFloat(latitude), defect_type);

    const newComplaint = await Complaint.create({
      citizen_id: req.user._id,
      photo_url: photoFile.path,
      defect_type,
      severity,
      confidence_score,
      location: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      status: "AI_VERIFIED",
      assigned_department_id: department?._id || null,
      is_duplicate: !!existingDuplicate,
      duplicate_of: existingDuplicate ? existingDuplicate._id : null,
      duplicate_similarity_score: existingDuplicate ? 90 : null,
    });

    return res.status(201).json({ success: true, data: newComplaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process complaint." });
  }
};

// GET /api/complaints/me
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen_id: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints." });
  }
};

// GET /api/complaints/:id
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("assigned_department_id");
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaint." });
  }
};

// GET /api/complaints/:id/duplicates
export const getComplaintDuplicates = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    
    // Find all complaints that have this complaint as their duplicate_of
    const duplicates = await Complaint.find({ duplicate_of: complaint._id });
    res.status(200).json({ success: true, data: duplicates });
  } catch (error) {
    res.status(500).json({ message: "Error fetching duplicates." });
  }
};

// GET /api/complaints (Authority)
export const getAllComplaints = async (req, res) => {
  try {
    // Add basic filtering based on query params (e.g., ?status=REPORTED&defect_type=POTHOLE)
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department_id) filter.assigned_department_id = req.query.department_id;
    if (req.query.severity) filter.severity = req.query.severity;
    
    const complaints = await Complaint.find(filter).populate("assigned_department_id").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all complaints." });
  }
};

// PATCH /api/complaints/:id/status (Authority)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { status, resolved_at: status === "RESOLVED" ? new Date() : undefined }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: "Error updating status." });
  }
};

// POST /api/internal/detect-defect
export const detectDefectInternal = async (req, res) => {
    try {
        if(!req.file) return res.status(400).json({message: "Photo required"});
        const mlResult = await detectDefectViaML(req.file.path);
        res.status(200).json({ success: true, data: mlResult });
    } catch(error) {
        res.status(500).json({ message: "ML Service Error" });
    }
};

// POST /api/internal/check-duplicate
export const checkDuplicateInternal = async (req, res) => {
    try {
        const { longitude, latitude, defect_type } = req.body;
        const dup = await checkDuplicateHelper(parseFloat(longitude), parseFloat(latitude), defect_type);
        res.status(200).json({ success: true, hasDuplicate: !!dup, duplicate: dup });
    } catch(error) {
        res.status(500).json({ message: "Error checking duplicates" });
    }
}

// GET /api/departments
export const getDepartments = async (req, res) => {
    try {
        const depts = await Department.find();
        res.status(200).json({ success: true, data: depts });
    } catch(error) {
        res.status(500).json({ message: "Error fetching departments" });
    }
}