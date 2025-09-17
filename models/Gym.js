import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: String,
  location: String,
});

export default mongoose.model("Gym", gymSchema);
