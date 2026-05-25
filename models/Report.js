const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true },
  category: {
    type: String,
    enum: ['General Inquiry', 'Complaint', 'Fraud Report', 'Technical Issue', 'Billing Issue', 'Other'],
    default: 'General Inquiry',
  },
  subject:  { type: String, required: true, trim: true },
  message:  { type: String, required: true },
  status:   { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
