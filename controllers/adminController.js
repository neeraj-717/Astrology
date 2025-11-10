const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Blog = require("../models/Blog");

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name imageUrl")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: status },
      { new: true }
    ).populate("userId", "name email");
    
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

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, productCount, orderCount, blogCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Blog.countDocuments()
    ]);
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        blogs: blogCount,
        revenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};