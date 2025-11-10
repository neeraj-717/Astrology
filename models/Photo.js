
// models/Project.js
const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  imageUrl: { type: String },       
  imagePublicId: { type: String }, 
//   description:{type:String, required:true} 
},
  { timestamps: true });

module.exports = mongoose.model("Photos", photoSchema);
