import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  machine: { type: String, required: true }, 
  reps: { type: Number, min: 0, default: 0 },
  brisk_reps: { type: Number, min: 0, default: 0 },
  quality: { type: String, enum: ["good", "average", "bad"], default: "good" },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Session", sessionSchema);
