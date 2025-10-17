import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  age: Number,
  email: { type: String, match: /\S+@\S+\.\S+/ },
  membership: String,
  performanceScore: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
