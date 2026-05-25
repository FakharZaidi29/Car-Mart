const Report = require('../models/Report');
const { sendResolvedEmail } = require('../utils/mailer');
const log = require('../utils/logger');

exports.createReport = async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject and message are required' });
    }
    const report = await Report.create({
      name, email, category, subject, message,
      userId: req.user?._id || null,
    });
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const prev   = await Report.findById(req.params.id);
    if (!prev) return res.status(404).json({ success: false, message: 'Report not found' });

    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // Send email only when status changes TO resolved
    if (status === 'resolved' && prev.status !== 'resolved') {
      try {
        await sendResolvedEmail({
          to:       report.email,
          name:     report.name,
          subject:  report.subject,
          category: report.category,
        });
      } catch (mailErr) {
        console.error('Email send failed:', mailErr.message);
      }
    }

    if (req.user) await log(req.user._id, req.user.name, 'update_report', `Set report "${report.subject}" to ${status}`);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
