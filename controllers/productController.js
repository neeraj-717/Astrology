const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

// Create product with image upload
exports.createProduct = async (req, res) => {
  try {
    const { name, role, price, oldprice } = req.body;
    if (!name) return res.status(400).json({ msg: "Name is required" });
    if (!price) return res.status(400).json({ msg: "Price is required" });

    let imageUrl, imagePublicId;

    if (req.file) {
      imageUrl = req.file.path;            // Cloudinary URL
      imagePublicId = req.file.filename;   // Cloudinary public_id
    } else {
      return res.status(400).json({ msg: "Product image is required" });
    }

    const product = await Product.create({ 
      name, 
      role, 
      price: parseFloat(price), 
      oldprice: oldprice ? parseFloat(oldprice) : null, 
      imageUrl, 
      imagePublicId 
    });
    
    res.status(201).json({ product, msg: "Product created successfully" });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

// -----------------Get all team products---------------------------
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete product and image from Cloudinary
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Delete image from Cloudinary if exists
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId, { resource_type: "image" });
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, msg: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

