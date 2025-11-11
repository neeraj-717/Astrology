// models/TeamMember.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldprice: { type: Number },
  role: { type: String, required: true },
  imageUrl: { type: String },       
  imagePublicId: { type: String },  
},
  { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
