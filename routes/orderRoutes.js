const express = require("express");
const router = express.Router();
const { getUserOrders, getOrderById, cancelOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getUserOrders);
router.get("/:orderId", protect, getOrderById);
router.patch("/:orderId/cancel", protect, cancelOrder);

module.exports = router;