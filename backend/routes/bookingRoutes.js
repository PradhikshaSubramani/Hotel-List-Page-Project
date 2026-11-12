const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/bookings (protected by verifyToken)
router.post('/', verifyToken, bookingController.createBooking);

// GET /api/bookings (protected by verifyToken)
router.get('/', verifyToken, bookingController.getBookings);

module.exports = router;

