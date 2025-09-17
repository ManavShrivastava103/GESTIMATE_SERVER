import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Alert", alertSchema);
