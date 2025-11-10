const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index:true },
  password: String,
  mobile: String,
  role: { type: String, 
    enum:["user", "admin"],
    default: "user" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
