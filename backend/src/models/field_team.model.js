import mongoose from "mongoose";

const fieldTeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    callsign: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "EN ROUTE", "ON SITE", "MAINTENANCE", "OFFLINE"],
      default: "AVAILABLE",
    },
    membersCount: { type: Number, default: 4 },
    leadName: { type: String, default: "" },
    locationName: { type: String, default: "HQ Depot" },
    coordinates: {
      lat: { type: Number, default: 25.4358 },
      lng: { type: Number, default: 81.8463 },
    },
    currentTask: { type: String, default: "Standing by" },
    currentWorkOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    etaMin: { type: Number, default: 0 },
    equipment: { type: [String], default: [] },
    batteryPct: { type: Number, default: 100 },
    vehiclePlate: { type: String, default: "" },
    vehicleType: { type: String, default: "Repair Van" },
    shiftHours: { type: String, default: "06:00 - 18:00 IST" },
    todayCompletedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FieldTeam = mongoose.model("FieldTeam", fieldTeamSchema);
