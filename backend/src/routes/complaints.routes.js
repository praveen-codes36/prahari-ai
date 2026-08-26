import express from "express";
import multer from "multer";
import { 
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintDuplicates,
  getAllComplaints,
  updateComplaintStatus,
  detectDefectInternal,
  checkDuplicateInternal,
  getDepartments
} from "../controllers/complaint.controller.js";
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
router.get("/departments", protect, getDepartments); // Added from PRD

// ==========================================
// DYNAMIC ID ROUTES (Both)
// ==========================================
router.get("/:id", protect, getComplaintById);
router.get("/:id/duplicates", protect, getComplaintDuplicates);
router.patch("/:id/status", protect, updateComplaintStatus);

// ==========================================
// INTERNAL SERVICE ROUTES
// ==========================================
router.post("/internal/detect-defect", protect, upload.single("photo"), detectDefectInternal);
router.post("/internal/check-duplicate", protect, checkDuplicateInternal);

export default router;