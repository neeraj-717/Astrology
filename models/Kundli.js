const mongoose = require("mongoose");

const kundliSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  city: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  planets: { type: Object, required: true },
  interpretation: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Kundli", kundliSchema);