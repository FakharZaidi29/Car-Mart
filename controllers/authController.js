const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mailer');

// Helper: send token response
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  });
};

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password, phone, role } = req.body;

  const allowedRoles = ['customer', 'seller'];
  const assignedRole = allowedRoles.includes(role) ? role : 'customer';

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role: assignedRole });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// @route   GET /api/auth/me
// @access  Private (requires token)
const getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  });
};

// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (mailErr) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:  hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe, updateAvatar, forgotPassword, resetPassword };
