import express from "express";
import Gym from "../models/Gym.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { name } = req.query;
  const gyms = await Gym.find(name ? { name: new RegExp(name, "i") } : {});
  res.json(gyms);
});

export default router;
