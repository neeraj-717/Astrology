
// models/Project.js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title:{type:String, required:true},
  category:{type:String},
  imageUrl: { type: String },       
  imagePublicId: { type: String }, 
  description:{type:String, required:true} 
},
  { timestamps: true });

module.exports = mongoose.model("Blogs", blogSchema);
