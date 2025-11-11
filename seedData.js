require("dotenv").config();
const mongoose = require("mongoose");
const Blog = require("./models/Blog");
const Product = require("./models/Product");
const Photo = require("./models/Photo");

// Sample data
const sampleBlogs = [
  {
    name: "Pandit Purshotam Gaur",
    title: "Understanding Your Birth Chart",
    category: "Astrology Basics",
    description: "Learn how to read and interpret your birth chart for better life insights.",
    imageUrl: "https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Birth+Chart"
  },
  {
    name: "Pandit Purshotam Gaur", 
    title: "Planetary Remedies for Success",
    category: "Remedies",
    description: "Discover powerful planetary remedies to overcome obstacles and achieve success.",
    imageUrl: "https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Remedies"
  }
];

const sampleProducts = [
  {
    name: "Rudraksha Mala",
    price: 1500,
    oldprice: 2000,
    role: "Spiritual Protection",
    imageUrl: "https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Rudraksha"
  },
  {
    name: "Gemstone Ring",
    price: 5000,
    oldprice: 7000,
    role: "Planetary Remedy",
    imageUrl: "https://via.placeholder.com/300x300/FFD700/000000?text=Gemstone"
  },
  {
    name: "Yantra Set",
    price: 2500,
    oldprice: 3500,
    role: "Energy Enhancement",
    imageUrl: "https://via.placeholder.com/300x300/FF1493/FFFFFF?text=Yantra"
  },
  {
    name: "Puja Kit",
    price: 1200,
    oldprice: 1800,
    role: "Ritual Essentials",
    imageUrl: "https://via.placeholder.com/300x300/32CD32/FFFFFF?text=Puja+Kit"
  }
];

const samplePhotos = [
  {
    imageUrl: "https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Gallery+1"
  },
  {
    imageUrl: "https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Gallery+2"
  },
  {
    imageUrl: "https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Gallery+3"
  },
  {
    imageUrl: "https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Gallery+4"
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Blog.deleteMany({});
    await Product.deleteMany({});
    await Photo.deleteMany({});
    
    console.log("🗑️ Cleared existing data");

    // Insert sample data
    await Blog.insertMany(sampleBlogs);
    await Product.insertMany(sampleProducts);
    await Photo.insertMany(samplePhotos);
    
    console.log("✅ Sample data inserted successfully");
    console.log(`📝 Blogs: ${sampleBlogs.length}`);
    console.log(`🛍️ Products: ${sampleProducts.length}`);
    console.log(`📸 Photos: ${samplePhotos.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();