const express    = require('express');
const Newsletter = require('../models/Newsletter');

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ success: false, message: 'Already subscribed' });

    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already subscribed' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
