require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
  origin: [
    "https://astrology-new-seven.vercel.app",  // production
    "http://localhost:5173",                   // vite dev server
    "http://localhost:3000",                   // react dev server
    "http://localhost:3001",                   // alternative port
    "http://127.0.0.1:5173",                   // alternative localhost
    "http://127.0.0.1:3000"                    // alternative localhost
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
    console.log("Database:", mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });

//  Routes
app.get("/", (req, res) => res.send("Backend is running "));

// app.get("/api/users", async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// });

app.use('/api/auth', require('./routes/authRoutes'))
app.use("/api/blog", require("./routes/blogRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/contact", require('./routes/contactRoutes'));
app.use("/api/photo", require('./routes/photoRoutes'));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/kundli", require("./routes/kundliRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// app.post("/api/users", async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });

//   }
// });

// app.delete("/api/users/:id", async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);
//   res.json({ message: "User deleted" });
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
