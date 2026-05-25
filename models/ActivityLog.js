const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminName:   { type: String, default: 'Admin' },
  action:      { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
