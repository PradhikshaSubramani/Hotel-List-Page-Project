const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', reviewController.getHotelReviews);
router.post('/', verifyToken, reviewController.createHotelReview);

module.exports = router;

