import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema(
  {
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: "FieldTeam", required: true, index: true },
    sender: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);
