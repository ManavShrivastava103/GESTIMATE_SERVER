import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Gym from "../models/Gym.js"; // import Gym model

const router = express.Router();

// Login after selecting gym
router.post("/login", async (req, res) => {
  const { username, password, gymId } = req.body;

  if (!gymId) return res.status(400).json({ msg: "Gym must be selected" });

  try {
    // 1. Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 3. Check if user belongs to selected gym
    const gym = await Gym.findById(gymId).populate("users");
    if (!gym) return res.status(404).json({ msg: "Gym not found" });

    const userInGym = gym.users.some(u => u._id.toString() === user._id.toString());
    if (!userInGym)
      return res.status(403).json({ msg: "User not registered in this gym" });

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id, gymId: gym._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ user, gym, token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Optional: search gyms by name
router.get("/search-gyms", async (req, res) => {
  const { name } = req.query;
  try {
    const gyms = await Gym.find({ name: { $regex: name, $options: "i" } });
    res.json(gyms);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// TEMPORARY: Update user password
router.post("/update-password", async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ msg: "Username and newPassword are required" });
  }

  try {
    // 1. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Find user and update password
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "Password updated successfully", user: updatedUser.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


export default router;
