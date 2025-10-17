import express from "express";
import Gym from "../models/Gym.js";

const router = express.Router();

// GET all gyms (optional search by name)
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    const gyms = await Gym.find(name ? { name: new RegExp(name, "i") } : {}).populate("users deviceConfigs");
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET gym by id
router.get("/:id", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate("users") // still populate gym users
      .populate({
        path: "deviceConfigs",
        populate: { path: "current_user", select: "username email" } // populate current_user in deviceConfigs
      });

    if (!gym) return res.status(404).json({ msg: "Gym not found" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// POST create new gym
router.post("/", async (req, res) => {
  try {
    const { name, location, machines, users, deviceConfigs } = req.body;
    if (!name || !location || !machines) return res.status(400).json({ msg: "Missing required fields" });

    const existingGym = await Gym.findOne({ name });
    if (existingGym) return res.status(400).json({ msg: "Gym with this name already exists" });

    const newGym = new Gym({ name, location, machines, users, deviceConfigs });
    const savedGym = await newGym.save();
    res.status(201).json({ msg: "Gym created successfully", gym: savedGym });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// PUT update gym
router.put("/:id", async (req, res) => {
  try {
    const updatedGym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGym) return res.status(404).json({ msg: "Gym not found" });
    res.json({ msg: "Gym updated successfully", gym: updatedGym });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// DELETE gym
router.delete("/:id", async (req, res) => {
  try {
    const deletedGym = await Gym.findByIdAndDelete(req.params.id);
    if (!deletedGym) return res.status(404).json({ msg: "Gym not found" });
    res.json({ msg: "Gym deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
