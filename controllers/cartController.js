const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ msg: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [], totalPrice: 0 });

    const existingItem = cart.items.find((i) => i.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    const populated = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json({
      success: true,
      items: populated.items,
      totalPrice: populated.totalPrice,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart)
      return res.status(200).json({ success: true, items: [], totalPrice: 0 });
    res.status(200).json({
      success: true,
      items: cart.items,
      totalPrice: cart.totalPrice,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Remove item
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    const updated = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json({
      success: true,
      items: updated.items,
      totalPrice: updated.totalPrice,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ success: true, items: [], totalPrice: 0 });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
