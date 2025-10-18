import mongoose from "mongoose";

const deviceConfigSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  ssid: { type: String, required: true },
  password: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  max_extension: { type: Number, default: 0, min: 0 },
  light_colour_1: { type: Number, default: 0, min: 0, max: 255 },
  light_colour_2: { type: Number, default: 0, min: 0, max: 255 },
  light_colour_3: { type: Number, default: 0, min: 0, max: 255 },
  light_pattern: { type: String, default: "static" },
  min_acceleration: { type: Number, default: 0.0 },
  max_acceleration: { type: Number, default: 0.0 },
  current_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  machine_name: { type: String, default: "" },
});

deviceConfigSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("DeviceConfig", deviceConfigSchema);
