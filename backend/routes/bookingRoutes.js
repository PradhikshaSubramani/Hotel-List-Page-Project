const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, bookingController.createBooking);

router.get('/', verifyToken, bookingController.getBookings);
router.get('/all', verifyToken, requireAdmin, bookingController.getAllBookingsAdmin);

module.exports = router;

