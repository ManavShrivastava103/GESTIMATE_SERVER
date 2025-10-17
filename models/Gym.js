import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  machines: { type: [String], required: true, validate: v => v.length > 0 },
  users: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
  deviceConfigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "DeviceConfig" }]
});

export default mongoose.model("Gym", gymSchema);
