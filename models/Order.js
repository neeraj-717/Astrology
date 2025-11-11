const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
    },
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, default: "Pending" },
    paymentId: String,
    orderId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
