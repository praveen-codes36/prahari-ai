import express from "express";
import multer from "multer";
import { 
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintDuplicates,
  getAllComplaints,
  updateComplaintStatus,
  assignFieldTeam,
  submitRepairVerification,
  detectDefectInternal,
  checkDuplicateInternal,
  getDepartments,
  updateMaterialsUsed
} from "../controllers/complaints.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); 

// ==========================================
// CITIZEN ROUTES
// ==========================================
router.post("/", protect, upload.single("photo"), createComplaint); 
router.get("/me", protect, getMyComplaints);

// ==========================================
// AUTHORITY ROUTES
// ==========================================
// Must be defined before /:id so it doesn't clash
router.get("/", protect, getAllComplaints);

// ==========================================
// DYNAMIC ID ROUTES (Both)
// ==========================================
router.get("/:id", protect, getComplaintById);
router.get("/:id/duplicates", protect, getComplaintDuplicates);
router.patch("/:id/status", protect, updateComplaintStatus);

// Field Operations: persist material usage
router.patch("/:id/materials", protect, updateMaterialsUsed);

// Field Operations: Maintenance Command Center assigns a squad to a work order
router.patch("/:id/assign", protect, assignFieldTeam);

// Field Operations: Field Worker Mobile App submits the after-repair photo for AI verification
router.post("/:id/verify", protect, upload.single("afterPhoto"), submitRepairVerification);

export default router;