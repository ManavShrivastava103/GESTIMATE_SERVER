import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import sessionRoutes from "./routes/sessions.js";
import alertRoutes from "./routes/alerts.js";
import gymRoutes from "./routes/gyms.js";
import deviceConfigRoutes from "./routes/deviceconfigs.js"; 

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/device-config", deviceConfigRoutes); 

const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
