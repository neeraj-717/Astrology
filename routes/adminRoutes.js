const express = require("express");
const router = express.Router();
const { 
  getAllOrders, 
  updateOrderStatus, 
  getDashboardStats, 
  getAllUsers 
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Admin routes (should add admin role check middleware)
router.get("/orders", protect, getAllOrders);
router.patch("/orders/:orderId", protect, updateOrderStatus);
router.get("/stats", protect, getDashboardStats);
router.get("/users", protect, getAllUsers);

module.exports = router;