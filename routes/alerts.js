import express from "express";
import Alert from "../models/Alert.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

const router = express.Router();

// =================== GET ALERTS ===================
router.get("/", async (req, res) => {
  try {
    const { gymId } = req.query;

    if (!gymId) {
      return res.status(400).json({ msg: "Missing gymId parameter" });
    }

    // ✅ Correct field name is 'gym'
    const alerts = await Alert.find({ gym: gymId })
      .sort({ timestamp: -1 }) // latest first
      .select("message level timestamp");

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
});


// ================= CREATE ALERTS =================
// POST /api/alerts/create/:sessionId
router.post("/create/:sessionId", async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId).populate("user", "username");
    if (!session) return res.status(404).json({ msg: "Session not found" });
    if (!session.user) return res.status(400).json({ msg: "Session has no associated user" });

    const { username } = session.user;
    const { machine, reps, quality } = session;

    const { previous_rep_count, previous_rep_quality, gym } = req.body;

    // Gym is mandatory
    if (!gym) {
      return res.status(400).json({ msg: "Gym ID is required to create an alert." });
    }

    let alertData = null;
    let lessalert = false;

    // --- 1) Too many reps ---
    if (reps > 60) {
      lessalert = true;
      alertData = {
        user: session.user._id,
        session: session._id,
        machine,
        gym,
        message: `${username} performed too many reps on the ${machine} machine. Stop him to avoid injury & suggest rest for muscle recovery.`,
        level: "warning",
        timestamp: new Date(),
      };
    }

    // --- 2) Too few reps ---
  else if (reps > 0) {
  if (!previous_rep_count) {
    // No previous session: trigger if reps < 7
    if (reps < 7) {
      lessalert=true;
      alertData = {
        user: session.user._id,
        session: session._id,
        machine,
        gym,
        message: `${username} performed very few reps on the ${machine}. Make sure there are no issues affecting their performance.`,
        level: "info",
        timestamp: new Date(),
      };
    }
  } else {
    // Previous session exists: trigger if difference < 7
    const diff = reps - previous_rep_count;
    if (diff > 0 && diff < 7) {
      lessalert=true;
      alertData = {
        user: session.user._id,
        session: session._id,
        machine,
        gym,
        message: `${username} performed very few reps on the ${machine}. Make sure there are no issues affecting their performance.`,
        level: "info",
        timestamp: new Date(),
      };
    }
  }
}

    // --- 3) Bad quality ---
    if (quality === "bad" && lessalert == false) {
      if (!previous_rep_quality || ["good", "average"].includes(previous_rep_quality)) {
        alertData = {
          user: session.user._id,
          session: session._id,
          machine,
          gym,
          message: `${username}'s session on the ${machine} machine showed jerky or inconsistent reps. Help user execute controlled movement & avoid injuries.`,
          level: "warning",
          timestamp: new Date(),
        };
      }
    }

    // --- 4) Average quality ---
    else if (quality === "average" && lessalert == false) {
      if (!previous_rep_quality || previous_rep_quality === "good") {
        alertData = {
          user: session.user._id,
          session: session._id,
          machine,
          gym,
          message: `${username}'s session on the ${machine} machine could be done with better control and smoother motion.`,
          level: "info",
          timestamp: new Date(),
        };
      }
    }

    // --- No alert needed ---
    if (!alertData) {
      return res.json({ msg: "Everything was fine — no alert created." });
    }

    // --- Save alert ---
    const createdAlert = await Alert.create(alertData);

    res.status(201).json({ msg: "Alert created successfully", alert: createdAlert });
  } catch (err) {
    console.error("Error creating alert:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// =================== DELETE ALERT ===================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAlert = await Alert.findByIdAndDelete(id);
    if (!deletedAlert) {
      return res.status(404).json({ msg: "Alert not found" });
    }

    res.json({ msg: "Alert deleted successfully", deletedAlert });
  } catch (err) {
    console.error("Error deleting alert:", err);
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
});


export default router;

