import express from "express";
import bcrypt from "bcryptjs"; // ✅ for hashing
import User from "../models/User.js";
import Session from "../models/Session.js";

const router = express.Router();

// =================== GET ALL USERS ===================
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =================== GET SINGLE USER (WITH SESSIONS) ===================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const sessions = await Session.find({ user: user._id }).lean();
    res.json({ ...user.toObject(), sessions });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =================== CREATE NEW USER ===================
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ msg: "Please provide all required fields" });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User with this email already exists" });

    // ✅ Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "User created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =================== UPDATE USER PASSWORD ===================
router.put("/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ msg: "Both current and new passwords are required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ✅ Compare current password with stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ msg: "Current password is incorrect" });

    // ✅ Hash new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =================== DELETE USER ===================
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Optional: Delete all sessions related to the user
    await Session.deleteMany({ user: user._id });

    await user.deleteOne();

    res.json({ msg: "User and related sessions deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
