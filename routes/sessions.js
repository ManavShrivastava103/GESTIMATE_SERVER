import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// Get all sessions
router.get("/", async (req, res) => {
  const sessions = await Session.find().populate("user", "username");
  res.json(sessions);
});

// Get sessions of a user
router.get("/:id", async (req, res) => {
  const sessions = await Session.find({ user: req.params.id });
  res.json(sessions);
});

export default router;
