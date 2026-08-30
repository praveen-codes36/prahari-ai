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

const COST_BY_SEVERITY = { LOW: 8000, MEDIUM: 15000, HIGH: 30000, CRITICAL: 50000 };

const buildRepairPlan = (severity, mlResult = {}) => {
  const completion = severity === "CRITICAL" ? 240 : severity === "HIGH" ? 180 : severity === "MEDIUM" ? 120 : 60;
  const material = mlResult.recommended_repair?.material || mlResult.material || "Standard repair material";
  return {
    materials: Array.isArray(mlResult.recommended_repair?.materials)
      ? mlResult.recommended_repair.materials
      : [material],
    estimated_completion_minutes: Number(mlResult.recommended_repair?.estimated_completion_minutes ?? completion),
    safety_requirements: mlResult.recommended_repair?.safety_requirements || ["Secure work zone before repair"],
  };
};

// ==========================================
// INTERNAL HELPERS
// ==========================================
export const detectDefectViaML = async (filePath) => {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  try {
    const response = await axios.post(ML_SERVICE_URL, formData, { headers: formData.getHeaders(), timeout: 30000 });
    return { available: true, ...response.data };
  } catch (err) {
    console.warn("ML Service unavailable:", err.message);
    return { available: false, error: err.message };
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
    const aiAvailable = mlResult.available !== false;
    const raw_defect = aiAvailable ? (mlResult.defect_type || "OTHER") : "OTHER";
    const defect_type = MAP_ML_LABEL_TO_ENUM[raw_defect] || raw_defect || "OTHER";
    const severity = aiAvailable && ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(mlResult.severity)
      ? mlResult.severity
      : "MEDIUM";
    const confidence_score = aiAvailable && Number.isFinite(Number(mlResult.confidence_score))
      ? Number(mlResult.confidence_score)
      : null;
    const risk_score = Number.isFinite(Number(mlResult.risk_score)) ? Number(mlResult.risk_score) : null;
    const recommendation = mlResult.recommended_repair || mlResult.ai_recommendation || {};
    const repair_plan = buildRepairPlan(severity, mlResult);

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
      risk_score,
      ai_analysis_status: aiAvailable ? "AVAILABLE" : "UNAVAILABLE",
      ai_recommendation: {
        estimated_depth_cm: recommendation.estimated_depth_cm ?? recommendation.depth_cm ?? null,
        material: recommendation.material || "",
        material_kg: recommendation.material_kg ?? null,
        safety_zone_m: recommendation.safety_zone_m ?? null,
        notes: recommendation.notes || "",
      },
      repair_plan,
      materials_used: {},
      estimated_cost_inr: COST_BY_SEVERITY[severity],
      location: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)], address: address || "" },
      status: aiAvailable ? "AI_VERIFIED" : "REPORTED",
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

// POST /api/complaints/work-order (Authority generated preventive work order)
export const createWorkOrder = async (req, res) => {
  try {
    const {
      road_name,
      location_name,
      coordinates,
      defect_type = "POTHOLE",
      severity = "HIGH",
      department_name = "Road",
      assigned_team_name,
      estimated_cost_inr,
      scheduled_time,
      description
    } = req.body;

    let department = await Department.findOne({ name: new RegExp(department_name || "Road", "i") });
    if (!department) {
      department = await Department.findOne({});
    }

    let assigned_team_id = null;
    if (assigned_team_name) {
      const firstWord = assigned_team_name.split(" ")[0];
      const team = await FieldTeam.findOne({ name: new RegExp(firstWord, "i") });
      if (team) assigned_team_id = team._id;
    }
    if (!assigned_team_id) {
      const anyTeam = await FieldTeam.findOne({});
      if (anyTeam) assigned_team_id = anyTeam._id;
    }

    const coords = Array.isArray(coordinates) && coordinates.length === 2 ? coordinates : [81.8463, 25.4358];

    const newOrder = await Complaint.create({
      citizen_id: req.user?._id || req.user?.id,
      road_name: road_name || "Prayagraj Arterial Corridor",
      location: {
        type: "Point",
        coordinates: coords,
        address: location_name || "Civil Lines, Prayagraj"
      },
      defect_type: defect_type,
      severity: severity,
      confidence_score: 95,
      status: "ASSIGNED",
      assigned_department_id: department?._id,
      assigned_team_id: assigned_team_id,
      estimated_cost_inr: estimated_cost_inr || 185000,
      scheduled_time: scheduled_time || "Within 7 Days",
      repair_plan: {
        materials: ["Micro-surfacing polymer", "Asphalt aggregate", "Subgrade seal grout"],
        estimated_completion_minutes: 180,
        safety_requirements: ["High-visibility barricades", "Lane flow divergence", "Surface temperature audit"]
      },
      ai_recommendation: {
        material: "Polymer cold-mix & structural grout",
        material_kg: 450,
        safety_zone_m: 25,
        notes: description || "Preventive intervention to avoid catastrophic 90-day subgrade collapse.",
        available: true
      }
    });

    if (assigned_team_id) {
      await FieldTeam.findByIdAndUpdate(assigned_team_id, {
        currentWorkOrderId: newOrder._id,
        currentTask: `Preventive: ${road_name || 'Corridor repair'}`,
        status: "ASSIGNED"
      });
    }

    triggerClosedLoop(newOrder, "work_order_created");

    return res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("createWorkOrder Error:", error);
    return res.status(500).json({ message: "Failed to create work order", error: error.message });
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


// PATCH /api/complaints/:id/materials
export const updateMaterialsUsed = async (req, res) => {
  try {
    const allowed = ["cold_mix_bags", "asphalt_kg", "concrete_kg", "compactor_minutes"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const value = Number(req.body[key]);
        if (!Number.isFinite(value) || value < 0) return res.status(400).json({ message: `${key} must be a non-negative number.` });
        update[`materials_used.${key}`] = value;
      }
    }
    if (req.body.other_materials !== undefined) {
      if (!Array.isArray(req.body.other_materials)) return res.status(400).json({ message: "other_materials must be an array." });
      update["materials_used.other_materials"] = req.body.other_materials;
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: "No material values supplied." });
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    return res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    console.error("updateMaterialsUsed Error:", error);
    return res.status(500).json({ message: "Failed to update material usage.", error: error.message });
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
        estimated_cost_inr: Number.isFinite(Number(estimatedCostInr)) ? Number(estimatedCostInr) : undefined,
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
      await FieldTeam.findByIdAndUpdate(
        complaint.assigned_team_id,
        {
          $set: { status: "AVAILABLE", currentWorkOrderId: null, currentTask: "Standing by" },
          $inc: { todayCompletedCount: 1 },
        }
      );
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
        res.status(mlResult.available === false ? 503 : 200).json({ success: mlResult.available !== false, data: mlResult });
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