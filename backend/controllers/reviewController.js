const { pool } = require('../config/db');

const reviewController = {

  async getHotelReviews(req, res) {
    try {
      const hotelId = parseInt(req.params.id, 10);

      if (isNaN(hotelId)) {
        return res.status(400).json({ error: 'Invalid hotel ID.' });
      }

      const hotelCheck = await pool.query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
      if (hotelCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }

      const statsResult = await pool.query(
        `SELECT 
           COUNT(*)::int AS total_reviews,
           COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating
         FROM reviews
         WHERE hotel_id = $1`,
        [hotelId]
      );

      const reviewsResult = await pool.query(
        `SELECT 
           r.id,
           r.hotel_id,
           r.user_id,
           r.rating,
           r.comment,
           r.created_at,
           u.name AS user_name,
           u.name AS reviewer_name,
           u.email AS user_email
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.hotel_id = $1
         ORDER BY r.created_at DESC`,
        [hotelId]
      );

      const totalReviews = statsResult.rows[0]?.total_reviews || 0;
      const averageRating = parseFloat(statsResult.rows[0]?.average_rating) || 0;

      return res.status(200).json({
        hotelId,
        averageRating,
        totalReviews,
        reviews: reviewsResult.rows,
      });
    } catch (err) {
      console.error('Error fetching hotel reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews: ' + err.message });
    }
  },

  async createHotelReview(req, res) {
    try {
      const hotelId = parseInt(req.params.id, 10);

      if (isNaN(hotelId)) {
        return res.status(400).json({ error: 'Invalid hotel ID.' });
      }

      if (!req.user || req.user.role !== 'user') {
        return res.status(403).json({ error: 'Access denied: Only regular users can submit reviews.' });
      }

      const hotelCheck = await pool.query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
      if (hotelCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }

      const { rating, comment } = req.body;

      const parsedRating = parseInt(rating, 10);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      }

      if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
        return res.status(400).json({ error: 'Feedback comment is required.' });
      }

      const userId = req.user.id;

      const insertQuery = `
        INSERT INTO reviews (hotel_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, hotel_id, user_id, rating, comment, created_at;
      `;
      const insertResult = await pool.query(insertQuery, [
        hotelId,
        userId,
        parsedRating,
        comment.trim(),
      ]);

      const createdReviewId = insertResult.rows[0].id;

      const fullReviewResult = await pool.query(
        `SELECT 
           r.id,
           r.hotel_id,
           r.user_id,
           r.rating,
           r.comment,
           r.created_at,
           u.name AS user_name,
           u.name AS reviewer_name,
           u.email AS user_email
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.id = $1`,
        [createdReviewId]
      );

      return res.status(201).json({
        message: 'Review submitted successfully.',
        review: fullReviewResult.rows[0],
      });
    } catch (err) {
      console.error('Error creating hotel review:', err);
      return res.status(500).json({ error: 'Failed to submit review: ' + err.message });
    }
  },
};

module.exports = reviewController;

