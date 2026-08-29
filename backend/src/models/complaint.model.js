import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photo_url: { type: String, required: true },
    defect_type: {
      type: String,
      enum: ["POTHOLE", "BROKEN_STREETLIGHT", "GARBAGE", "DRAINAGE", "OTHER"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    confidence_score: { type: Number, min: 0, max: 100 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] 
        required: true,
      },
      address: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: [
        "REPORTED",
        "AI_VERIFIED",
        "ASSIGNED",
        "EN_ROUTE",
        "ON_SITE",
        "WORK_IN_PROGRESS",
        "INSPECTION",
        "RESOLVED",
      ],
      default: "REPORTED",
    },
    assigned_department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    assigned_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FieldTeam",
      default: null,
    },
    estimated_cost_inr: { type: Number, default: null },
    repair_photo_url: { type: String, default: null },
    repair_verified: { type: Boolean, default: false },
    repair_verification_notes: { type: String, default: "" },
    is_duplicate: { type: Boolean, default: false },
    duplicate_of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    duplicate_similarity_score: { type: Number, default: null },
    resolved_at: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });

export const Complaint = mongoose.model("Complaint", complaintSchema);