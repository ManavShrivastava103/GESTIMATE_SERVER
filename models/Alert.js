import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["info", "warning", "critical"], default: "info" },
  timestamp: { type: Date, default: Date.now },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true } // Reference to Gym
});

export default mongoose.model("Alert", alertSchema);
