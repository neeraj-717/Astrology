const Photo = require("../models/Photo");
const cloudinary = require("../utils/cloudinary");


// Create team member with image upload
exports.createPhoto = async (req, res) => {
  try {
    // const { name , title, description, category } = req.body;
    // console.log('category', category)
    // if (!name) return res.status(400).json({ msg: "Name is required" });

    let imageUrl, imagePublicId;

    if (req.file) {
      imageUrl = req.file.path;            // Cloudinary URL
      imagePublicId = req.file.filename;   // Cloudinary public_id
    }
    
console.log("hello createphoto")
    const photo = await Photo.create({ imageUrl, imagePublicId });
    res.status(201).json({photo, msg:"photo created" });
  

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

// -----------------Get all team members---------------------------
exports.getPhoto = async (req, res) => {
  try {
    console.log('Fetching photos...');
    const photo = await Photo.find().sort({ createdAt: -1 });
    console.log('Photos found:', photo.length);
    res.json(photo);
  } catch (err) {
    console.error('Error in getPhoto:', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Delete team member and image from Cloudinary
exports.deletePhoto = async (req, res) => {
//   console.log(" Delete endpoint hit");

  try {
    const { id } = req.params;
    // console.log(" Deleting service with id:", id);

    const photo = await Photo.findById(id);
    // console.log(" Found service:", service);

    if (!photo) {
      
      return res.status(404).json({ msg: "Service not found" });
    }

    if (photo.imagePublicId) {
      // console.log(" Deleting image from Cloudinary:", service.imagePublicId);
      
      const result = await cloudinary.uploader.destroy(photo.imagePublicId, { resource_type: "image" });
      // console.log(" Cloudinary delete result:", result);
    }

    await Photo.findByIdAndDelete(id);
    // console.log(" photo deleted from DB");

    res.json({ success: true, msg: "Service deleted successfully" });
  } catch (err) {
    // console.error(" Delete error:", err);
    res.status(500).json({ msg: "Server error", details: err.message });
  }
};

