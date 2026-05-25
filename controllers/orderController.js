const Order = require('../models/Order');
const Car   = require('../models/Car');
const log   = require('../utils/logger');

// @route  POST /api/orders
// @access Private
const createOrder = async (req, res) => {
  try {
    const { carId, customer, payment, totalAmount } = req.body;

    const car = await Car.findById(carId);
    if (!car)              return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.status !== 'available') return res.status(400).json({ success: false, message: 'Car is no longer available' });

    const order = await Order.create({
      user:        req.user._id,
      car:         carId,
      carSnapshot: { make: car.make, model: car.model, year: car.year, price: car.price, image: car.image },
      customer,
      payment,
      totalAmount,
    });

    // Mark car as sold
    car.status = 'sold';
    await car.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route  GET /api/orders/my
// @access Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/orders
// @access Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await log(req.user._id, req.user.name, 'update_order', `Updated order ${order.orderId} status to ${req.body.status}`);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
