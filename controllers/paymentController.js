const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
require("dotenv").config();

// ✅ Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('Razorpay initialized successfully');
} catch (error) {
  console.error('Razorpay initialization failed:', error);
}

// ✅ Create order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      console.log('Razorpay not configured, using test mode for product order');
      // Return test mode response
      return res.status(200).json({
        success: true,
        key_id: "rzp_test_demo",
        order_id: `test_order_${Date.now()}`,
        order_amount: amount * 100,
        currency: "INR",
        testMode: true
      });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: receipt || `p_${Date.now().toString().slice(-8)}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      order_amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ msg: "Failed to create order", error: err.message });
  }
};

// ✅ Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    // Handle test payments
    if (razorpay_order_id?.startsWith('test_order_') || razorpay_signature === 'test_signature') {
      console.log('Processing test payment for product order');
      
      if (orderData) {
        // Save test order to DB
        const newOrder = new Order({
          userId: orderData.userId,
          items: orderData.items.map(item => ({
            productId: item.productId || item._id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
          })),
          shippingAddress: orderData.shippingAddress,
          totalPrice: orderData.totalPrice,
          paymentStatus: "Completed",
          paymentId: razorpay_payment_id || `test_pay_${Date.now()}`,
          orderId: razorpay_order_id || `test_order_${Date.now()}`,
        });

        await newOrder.save();
        return res.status(200).json({ success: true, msg: "Test payment verified and order placed" });
      }
      
      return res.status(200).json({ success: true, msg: "Test payment verified successfully" });
    }

    // Real Razorpay verification
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ msg: "Payment gateway not configured" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid signature, payment verification failed" });
    }

    // For kundli payments, we don't need to save order data
    if (!orderData) {
      return res.status(200).json({ success: true, msg: "Payment verified successfully" });
    }

    // ✅ Save order to DB (for product orders)
    const newOrder = new Order({
      userId: orderData.userId,
      items: orderData.items.map(item => ({
        productId: item.productId || item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity)
      })),
      shippingAddress: orderData.shippingAddress,
      totalPrice: orderData.totalPrice,
      paymentStatus: "Completed",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await newOrder.save();
    res.status(200).json({ success: true, msg: "Payment verified and order placed" });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ msg: "Payment verification failed", error: err.message });
  }
};

// Create Razorpay order for Kundli payment
exports.createKundliOrder = async (req, res) => {
  try {
    const { amount, kundliData } = req.body;
    const userId = req.user?.id;

    console.log('Create order request:', { amount, kundliData, userId });

    if (!amount || !kundliData || !userId) {
      return res.status(400).json({ msg: "Invalid payment data" });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      console.log('Razorpay not configured, using test mode');
      // Fallback for testing without Razorpay
      const mockOrder = {
        id: `order_test_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        receipt: `kundli_${userId}_${Date.now()}`,
        status: "created"
      };
      
      return res.status(200).json({
        success: true,
        order: mockOrder,
        razorpayKey: "rzp_test_demo",
        testMode: true
      });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `k_${Date.now().toString().slice(-8)}`, // Keep under 40 chars
      notes: {
        service: 'kundli_generation',
        userId: userId,
        name: kundliData.name
      }
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order.id);

    res.status(200).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      msg: "Failed to create payment order", 
      error: err.message 
    });
  }
};

// Verify Kundli payment
exports.verifyKundliPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, kundliData } = req.body;
    const userId = req.user?.id;

    // Handle test mode
    if (razorpay_order_id?.startsWith('order_test_')) {
      console.log('Test mode payment verification');
      return res.status(200).json({
        success: true,
        paymentId: razorpay_payment_id || `pay_test_${Date.now()}`,
        msg: "Test payment verified successfully"
      });
    }

    // Real Razorpay verification
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false, 
        msg: "Payment gateway not configured" 
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        msg: "Payment verification failed - Invalid signature" 
      });
    }

    // Payment verified successfully
    console.log(`Kundli payment verified: ${razorpay_payment_id} for user ${userId}`);

    res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id,
      msg: "Payment verified successfully"
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ 
      success: false, 
      msg: "Payment verification failed" 
    });
  }
};
