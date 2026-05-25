const express    = require('express');
const { body }   = require('express-validator');
const passport   = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const { register, login, getMe, updateMe, updateAvatar, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Google OAuth Strategy ─────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(null, false);

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name:     profile.displayName || email.split('@')[0],
          email,
          password: `google_oauth_${profile.id}_${Date.now()}`,
          role:     'customer',
          avatar:   profile.photos?.[0]?.value || '',
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// ── Google OAuth Routes ───────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=google_failed',
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    const userData = encodeURIComponent(JSON.stringify({
      _id:    req.user._id,
      name:   req.user.name,
      email:  req.user.email,
      role:   req.user.role,
      avatar: req.user.avatar || '',
    }));
    res.redirect(`http://localhost:5173/auth/callback?token=${token}&user=${userData}`);
  }
);

// ── Regular Auth Routes ───────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.get('/me',              protect, getMe);
router.put('/me',              protect, updateMe);
router.put('/me/avatar',       protect, updateAvatar);
router.post('/forgot-password',         forgotPassword);
router.put('/reset-password/:token',    resetPassword);

module.exports = router;
