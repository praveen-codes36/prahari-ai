import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    citizen_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    photo_url: { type: String, required: true },
    defect_type: {
      type: String,
      enum: ["POTHOLE", "BROKEN_STREETLIGHT", "GARBAGE", "DRAINAGE", "OTHER"],
      required: true,
    },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    confidence_score: { type: Number, min: 0, max: 100, default: null },
    // Kept separate from confidence_score. Confidence means model certainty; risk means public impact.
    risk_score: { type: Number, min: 0, max: 100, default: null },
    ai_analysis_status: {
      type: String,
      enum: ["PENDING", "AVAILABLE", "UNAVAILABLE", "MANUAL_REVIEW"],
      default: "PENDING",
    },
    ai_recommendation: {
      estimated_depth_cm: { type: Number, default: null },
      material: { type: String, default: "" },
      material_kg: { type: Number, default: null },
      safety_zone_m: { type: Number, default: null },
      notes: { type: String, default: "" },
    },
    repair_plan: {
      materials: { type: [String], default: [] },
      estimated_completion_minutes: { type: Number, default: null },
      safety_requirements: { type: [String], default: [] },
    },
    materials_used: {
      cold_mix_bags: { type: Number, default: 0, min: 0 },
      asphalt_kg: { type: Number, default: 0, min: 0 },
      concrete_kg: { type: Number, default: 0, min: 0 },
      compactor_minutes: { type: Number, default: 0, min: 0 },
      other_materials: {
        type: [{ name: String, quantity: Number, unit: String }],
        default: [],
      },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["REPORTED", "AI_VERIFIED", "ASSIGNED", "EN_ROUTE", "ON_SITE", "WORK_IN_PROGRESS", "INSPECTION", "RESOLVED"],
      default: "REPORTED",
    },
    assigned_department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    assigned_team_id: { type: mongoose.Schema.Types.ObjectId, ref: "FieldTeam", default: null },
    estimated_cost_inr: { type: Number, default: null },
    actual_cost_inr: { type: Number, default: null },
    repair_photo_url: { type: String, default: null },
    repair_verified: { type: Boolean, default: false },
    repair_verification_notes: { type: String, default: "" },
    is_duplicate: { type: Boolean, default: false },
    duplicate_of: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
    duplicate_similarity_score: { type: Number, default: null },
    resolved_at: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });

export const Complaint = mongoose.model("Complaint", complaintSchema);
