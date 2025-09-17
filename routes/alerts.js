import express from "express";
import Alert from "../models/Alert.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const alerts = await Alert.find();
  res.json(alerts);
});

export default router;
