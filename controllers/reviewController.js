const Review = require('../models/Review');

// GET /api/reviews/car/:carId — public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews/car/:carId — protected
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment?.trim()) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }
    const existing = await Review.findOne({ car: req.params.carId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this car' });
    }
    const review = await Review.create({
      car:      req.params.carId,
      user:     req.user._id,
      userName: req.user.name,
      rating:   Number(rating),
      comment:  comment.trim(),
    });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:reviewId — protected (own review)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { rating, comment } = req.body;
    if (rating)  review.rating  = Number(rating);
    if (comment) review.comment = comment.trim();
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:reviewId — protected (own or admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('car', 'make model year');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview, getAllReviews };
