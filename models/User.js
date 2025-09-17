import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  email: String,
  membership: String,
  performanceScore: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);
