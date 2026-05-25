const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  make:         { type: String, required: [true, 'Make is required'], trim: true },
  model:        { type: String, required: [true, 'Model is required'], trim: true },
  year:         { type: Number, required: [true, 'Year is required'] },
  price:        { type: Number, required: [true, 'Price is required'] },
  mileage:      { type: Number, default: 0 },
  fuel:         { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'], default: 'Petrol' },
  transmission: { type: String, enum: ['Auto', 'Manual'], default: 'Auto' },
  type:         { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Van', 'Sports', 'Other'], default: 'Sedan' },
  color:        { type: String, default: '' },
  badge:        { type: String, default: null },
  description:  { type: String, default: '' },
  features:     [{ type: String }],
  image:        { type: String, default: '' },
  images:       [{ type: String }],
  seller: {
    name:     { type: String, default: 'CarMart Dealer' },
    city:     { type: String, default: 'Lahore' },
    email:    { type: String, default: '' },
    rating:   { type: Number, default: 4.5 },
    reviews:  { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    phone:    { type: String, default: '' },
  },
  listingType: { type: String, enum: ['dealer', 'used'], default: 'dealer' },
  status:    { type: String, enum: ['available', 'sold', 'pending', 'rejected'], default: 'available' },
  featured:  { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Text index for search
CarSchema.index({ make: 'text', model: 'text', description: 'text', color: 'text' });

module.exports = mongoose.model('Car', CarSchema);
