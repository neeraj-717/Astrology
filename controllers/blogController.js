const Blog = require("../models/Blog");
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");


// Create team member with image upload
exports.createBlog = async (req, res) => {
  try {
    const { name , title, description, category } = req.body;
    console.log('category', category)
    if (!name) return res.status(400).json({ msg: "Name is required" });

    let imageUrl, imagePublicId;

    if (req.file) {
      imageUrl = req.file.path;            // Cloudinary URL
      imagePublicId = req.file.filename;   // Cloudinary public_id
    }
    
console.log("hello createblog")
    const blog = await Blog.create({ name, title, category, description, imageUrl, imagePublicId });
    res.status(201).json({blog, msg:"blog created" });
  

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

// -----------------Get all team members---------------------------
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.find().sort({ createdAt: -1 });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete blog and image from Cloudinary
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid blog ID" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Delete image from Cloudinary if exists
    if (blog.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(blog.imagePublicId, { resource_type: "image" });
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
        // Continue with blog deletion even if image deletion fails
      }
    }

    await Blog.findByIdAndDelete(id);

    res.json({ success: true, msg: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

