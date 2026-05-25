const express = require('express');
const router  = express.Router();
const { getReviews, createReview, updateReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin/all', protect, adminOnly, getAllReviews);
router.get('/car/:carId',           getReviews);
router.post('/car/:carId',  protect, createReview);
router.put('/:reviewId',    protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
