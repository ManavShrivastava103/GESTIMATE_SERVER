import express from "express";
import DeviceConfig from "../models/DeviceConfig.js";
import Session from "../models/Session.js";

const router = express.Router();

/* ===============================
   GET device config by deviceId
=============================== */
router.get("/:deviceId", async (req, res) => {
  try {
    const config = await DeviceConfig.findOne({ deviceId: req.params.deviceId })
      .populate("current_user", "username email") // ✅ populate user fields
      .lean();

    if (!config)
      return res.status(404).json({ msg: "Device not found" });

    res.json(config);
  } catch (err) {
    console.error("GET /:deviceId error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ===============================
   POST create or update device config
=============================== */
router.post("/", async (req, res) => {
  try {
    const {
      deviceId,
      ssid,
      password,
      max_extension,
      light_colour_1,
      light_colour_2,
      light_colour_3,
      light_pattern,
      min_acceleration,
      max_acceleration,
      current_user,
      machine_name
    } = req.body;

    if (!deviceId || !ssid || !password)
      return res.status(400).json({ msg: "Missing required fields" });

    const updateFields = {
      ssid,
      password,
      max_extension,
      light_colour_1,
      light_colour_2,
      light_colour_3,
      light_pattern,
      min_acceleration,
      max_acceleration,
      current_user,
      machine_name,
      updatedAt: Date.now()
    };

    const updatedConfig = await DeviceConfig.findOneAndUpdate(
      { deviceId },
      { $set: updateFields },
      { new: true, upsert: true }
    ).populate("current_user", "username email");

    res.json({
      msg: "Device configuration saved successfully",
      config: updatedConfig
    });
  } catch (err) {
    console.error("POST / error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ===============================
   PATCH assign / release current user
=============================== */
router.patch("/:deviceId/current-user", async (req, res) => {
  try {
    const { current_user } = req.body;

    const updatedConfig = await DeviceConfig.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { current_user: current_user || null, updatedAt: Date.now() },
      { new: true }
    ).populate("current_user", "username email");

    if (!updatedConfig)
      return res.status(404).json({ msg: "Device not found" });

    res.json({
      msg: current_user
        ? "✅ Device assigned successfully"
        : "✅ Device released successfully",
      config: updatedConfig
    });
  } catch (err) {
    console.error("PATCH /current-user error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ===============================
   POST end session for a device
=============================== */
router.post("/:deviceId/end-session", async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Update all active sessions for this device
    const sessions = await Session.find({ machine: deviceId });
    if (!sessions.length)
      return res.status(404).json({ msg: "No sessions found for this device" });

    await Session.updateMany({ machine: deviceId }, { $set: { ended: true } });

    // Clear the current user on the device
    await DeviceConfig.findOneAndUpdate(
      { deviceId },
      { current_user: null, updatedAt: Date.now() }
    );

    res.json({ msg: "✅ All sessions ended and device released" });
  } catch (err) {
    console.error("POST /end-session error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
