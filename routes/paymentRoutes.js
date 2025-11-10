const express = require("express");
const { createPaymentOrder, verifyPayment, createKundliOrder, verifyKundliPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify-payment",protect, verifyPayment);
router.post("/create-kundli-order", protect, createKundliOrder);
router.post("/verify-kundli-payment", protect, verifyKundliPayment);

module.exports = router;
