const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createReport, getAllReports, getMyReports, updateStatus, deleteReport,
} = require('../controllers/reportController');

// Attach user if token present, but don't block if absent
const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {}
  }
  next();
};

router.post('/',              optionalAuth, createReport);
router.get('/my',             protect,      getMyReports);
router.get('/',               protect, adminOnly, getAllReports);
router.put('/:id/status',     protect, adminOnly, updateStatus);
router.delete('/:id',         protect, adminOnly, deleteReport);

module.exports = router;
