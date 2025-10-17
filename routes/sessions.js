import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("user", "username email")
      .lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get sessions of a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.params.userId }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Log or update a session (from ESP32)
router.post("/", async (req, res) => {
  try {
    const { user, machine, reps = 0, brisk_reps = 0 } = req.body;

    if (!user || !machine) {
      return res.status(400).json({ msg: "Missing user or machine" });
    }

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's session for same user + machine
    let session = await Session.findOne({
      user,
      machine,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    if (session) {
      // Add new counts to existing
      session.reps += reps;
      session.brisk_reps += brisk_reps;
    } else {
      // Create new session
      session = new Session({
        user,
        machine,
        reps,
        brisk_reps,
        timestamp: new Date(),
      });
    }

    // --- Quality calculation ---
    if (session.reps > 0) {
      const ratio = (session.brisk_reps / session.reps) * 100;
      if (ratio < 15) session.quality = "good";
      else if (ratio < 40) session.quality = "average";
      else session.quality = "bad";
    } else {
      session.quality = "good"; // default if no reps yet
    }

    await session.save();

    res.status(200).json({
      msg: session.isNew ? "New session created" : "Session updated successfully",
      session,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
