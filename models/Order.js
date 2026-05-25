const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  // Snapshot of car at time of order (in case car data changes)
  carSnapshot: {
    make:  String,
    model: String,
    year:  Number,
    price: Number,
    image: String,
  },
  // Customer info filled at checkout
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
  },
  payment: {
    method:     { type: String, default: 'card' },
    cardLast4:  { type: String, default: '' },
    status:     { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  orderId: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate orderId before save
OrderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = 'CM-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
