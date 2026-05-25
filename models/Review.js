const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  car:      { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

ReviewSchema.index({ car: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
