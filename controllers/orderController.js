const Order = require("../models/Order");

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.productId");
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel order by customer
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    // Only allow cancellation if order is not already cancelled or completed
    if (order.paymentStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }
    
    if (order.paymentStatus === "Shipped" || order.paymentStatus === "Delivered") {
      return res.status(400).json({ success: false, message: "Cannot cancel shipped/delivered order" });
    }
    
    order.paymentStatus = "Cancelled";
    await order.save();
    
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};