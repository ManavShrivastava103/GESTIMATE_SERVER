import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  machine: String,
  sets: Number,
  quality: String,
});

export default mongoose.model("Session", sessionSchema);
