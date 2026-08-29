import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Complaint } from "../models/complaint.model.js";
import { Department } from "../models/Department.model.js";
import { FieldTeam } from "../models/field_team.model.js";
import { triggerRecalculation } from "./orchestration.controller.js";

const MAP_DEFECT_TO_DEPARTMENT = {
  POTHOLE: "Road",
  BROKEN_STREETLIGHT: "Electrical",
  GARBAGE: "Sanitation",
  DRAINAGE: "Public Works",
  OTHER: "Public Works"
};

const MAP_ML_LABEL_TO_ENUM = {
  "Pothole": "POTHOLE",
  "Streetlight Defect": "BROKEN_STREETLIGHT",
  "Garbage Accumulation": "GARBAGE",
  "Drainage Issues": "DRAINAGE"
};

// ==========================================
// INTERNAL HELPERS
// ==========================================
export const detectDefectViaML = async (filePath) => {
  try {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const response = await axios.post(ML_SERVICE_URL, formData, { headers: formData.getHeaders() });
    return response.data;
  } catch (err) {
    console.warn("ML Service unavailable, falling back to mock ML data:", err.message);
    return {
        defect_type: "Pothole",
        severity: "HIGH",
        confidence_score: 88
    };
  }
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

const triggerClosedLoop = (complaint, eventType) => {
    try {
        const mockReq = {
            body: {
                event_type: eventType,
                complaint_id: complaint._id,
                coordinates: complaint.location?.coordinates,
                factors: { severity: complaint.severity }
            }
        };
        const mockRes = { status: () => ({ json: () => {} }) };
        
        // Fire-and-forget orchestrator hook
        triggerRecalculation(mockReq, mockRes).catch(err => console.error("Closed loop async error:", err));
    } catch (err) {
        console.error("Failed to trigger closed loop", err);
    }
};


// POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { longitude, latitude, address } = req.body;
    const photoFile = req.file;

    if (!photoFile || !longitude || !latitude) return res.status(400).json({ message: "Photo and GPS required." });

    const mlResult = await detectDefectViaML(photoFile.path);
    const raw_defect = mlResult.defect_type || "OTHER";
    const defect_type = MAP_ML_LABEL_TO_ENUM[raw_defect] || "OTHER";
    const severity = mlResult.severity || "MEDIUM";
    const confidence_score = mlResult.confidence_score || 50;

    const deptName = MAP_DEFECT_TO_DEPARTMENT[defect_type] || "Public Works";
    let department = await Department.findOne({ name: deptName });

    // Auto-create department if it doesn't exist in the database yet
    if (!department) {
        department = await Department.create({ 
            name: deptName, 
            contact_email: `${deptName.toLowerCase().replace(/ /g, '')}@prahari.gov.in` 
        });
    }

    const existingDuplicate = await checkDuplicateHelper(parseFloat(longitude), parseFloat(latitude), defect_type);

    const newComplaint = await Complaint.create({
      citizen_id: req.user.id || req.user._id,
      photo_url: photoFile.path,
      defect_type,
      severity,
      confidence_score,
      location: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)], address: address || "" },
      status: "AI_VERIFIED",
      assigned_department_id: department?._id || null,
      is_duplicate: !!existingDuplicate,
      duplicate_of: existingDuplicate ? existingDuplicate._id : null,
      duplicate_similarity_score: existingDuplicate ? 90 : null,
    });

    // Feature 10: Closed-Loop System Trigger
    triggerClosedLoop(newComplaint, "complaint_created");

    return res.status(201).json({ success: true, data: newComplaint });
  } catch (error) {
    console.error("createComplaint Error:", error);
    return res.status(500).json({ message: "Failed to process complaint.", error: error.message, stack: error.stack });
  }
};

// GET /api/complaints/me
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen_id: req.user.id || req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints." });
  }
};

// GET /api/complaints/:id
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("assigned_department_id assigned_team_id");
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
    
    const complaints = await Complaint.find(filter).populate("assigned_department_id assigned_team_id").sort({ createdAt: -1 });
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
    
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    // Keep the assigned field team's live state synchronized with the work-order lifecycle.
    if (complaint.assigned_team_id) {
      const teamStatusMap = {
        ASSIGNED: "AVAILABLE",
        EN_ROUTE: "EN ROUTE",
        ON_SITE: "ON SITE",
        WORK_IN_PROGRESS: "ON SITE",
        INSPECTION: "ON SITE",
        RESOLVED: "AVAILABLE",
      };
      const teamUpdate = { status: teamStatusMap[status] };
      if (status === "RESOLVED") {
        teamUpdate.currentWorkOrderId = null;
        teamUpdate.currentTask = "Standing by";
      } else if (teamStatusMap[status]) {
        teamUpdate.currentWorkOrderId = complaint._id;
      }
      await FieldTeam.findByIdAndUpdate(complaint.assigned_team_id, teamUpdate);
    }

    triggerClosedLoop(complaint, `complaint_status_changed_to_${status}`);
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: "Error updating status." });
  }
};

// PATCH /api/complaints/:id/assign (Authority — Maintenance Command Center "Assign Team" modal)
export const assignFieldTeam = async (req, res) => {
  try {
    const { teamId, estimatedCostInr, scheduledTime } = req.body;
    if (!teamId) return res.status(400).json({ message: "teamId is required." });

    const team = await FieldTeam.findById(teamId);
    if (!team) return res.status(404).json({ message: "Field team not found." });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assigned_team_id: teamId,
        status: "ASSIGNED",
        estimated_cost_inr: estimatedCostInr ?? undefined,
      },
      { new: true }
    ).populate("assigned_department_id assigned_team_id");

    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    // Reflect the assignment on the team itself so Field Team Management stays in sync
    team.status = "EN ROUTE";
    team.currentWorkOrderId = complaint._id;
    team.currentTask = `${complaint.defect_type.replace(/_/g, " ")} repair @ ${complaint.location?.address || "field site"}`;
    team.etaMin = scheduledTime === "ASAP" || !scheduledTime ? 15 : team.etaMin;
    await team.save();

    triggerClosedLoop(complaint, "complaint_assigned_to_team");

    return res.status(200).json({ success: true, data: { complaint, team } });
  } catch (error) {
    console.error("assignFieldTeam Error:", error);
    return res.status(500).json({ message: "Failed to assign field team.", error: error.message });
  }
};

// POST /api/complaints/:id/verify (Field Worker Mobile App — "Verify with AI" step)
// Runs the after-repair photo back through the ML defect classifier. Low residual
// defect confidence => repair verified => work order auto-resolved.
export const submitRepairVerification = async (req, res) => {
  try {
    const afterPhoto = req.file;
    if (!afterPhoto) return res.status(400).json({ message: "After-repair photo required." });

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(afterPhoto.path));

    let verification;
    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/verify_repair`, formData, {
        headers: formData.getHeaders(),
      });
      verification = mlRes.data;
    } catch (mlErr) {
      console.warn("ML verify_repair unavailable, defaulting to manual review:", mlErr.message);
      verification = { repaired: false, residual_confidence: null, message: "ML service unavailable — flagged for manual review." };
    }

    const newStatus = verification.repaired ? "RESOLVED" : "INSPECTION";

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        repair_photo_url: afterPhoto.path,
        repair_verified: !!verification.repaired,
        repair_verification_notes: verification.message || "",
        status: newStatus,
        resolved_at: verification.repaired ? new Date() : undefined,
      },
      { new: true }
    ).populate("assigned_team_id");

    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    // Free the crew back up once verified so they show as AVAILABLE again
    if (verification.repaired && complaint.assigned_team_id) {
      await FieldTeam.findByIdAndUpdate(complaint.assigned_team_id, {
        status: "AVAILABLE",
        currentWorkOrderId: null,
        currentTask: "Standing by",
      });
    }

    triggerClosedLoop(complaint, `complaint_verification_${newStatus.toLowerCase()}`);

    return res.status(200).json({ success: true, data: { complaint, verification } });
  } catch (error) {
    console.error("submitRepairVerification Error:", error);
    return res.status(500).json({ message: "Failed to verify repair.", error: error.message });
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