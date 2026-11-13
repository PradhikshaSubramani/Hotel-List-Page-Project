const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { uploadMultiple } = require('../middleware/upload');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const reviewRoutes = require('./reviewRoutes');

router.use('/:id/reviews', reviewRoutes);

router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);

router.post('/', verifyToken, requireAdmin, uploadMultiple, hotelController.createHotel);
router.put('/:id', verifyToken, requireAdmin, uploadMultiple, hotelController.updateHotel);
router.delete('/:id', verifyToken, requireAdmin, hotelController.deleteHotel);

module.exports = router;
