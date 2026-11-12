const { pool } = require('../config/db');

const bookingController = {
  async createBooking(req, res) {
    try {
      const {
        hotel_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in,
        check_out,
        guests_count,
        total_price,
      } = req.body;

      if (
        !hotel_id ||
        !guest_name ||
        !guest_email ||
        !guest_phone ||
        !check_in ||
        !check_out ||
        guests_count === undefined ||
        total_price === undefined
      ) {
        return res.status(400).json({ error: 'All booking fields are required.' });
      }

      const numGuests = parseInt(guests_count, 10);
      if (isNaN(numGuests) || numGuests <= 0) {
        return res.status(400).json({ error: 'Number of guests must be at least 1.' });
      }

      const numTotal = parseFloat(total_price);
      if (isNaN(numTotal) || numTotal <= 0) {
        return res.status(400).json({ error: 'Total price must be a valid positive number.' });
      }

      const inDate = new Date(check_in);
      const outDate = new Date(check_out);

      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
        return res.status(400).json({ error: 'Invalid check-in or check-out date format.' });
      }

      if (outDate <= inDate) {
        return res.status(400).json({ error: 'Check-out date must be strictly after check-in date.' });
      }

      const hotelRes = await pool.query('SELECT id, title, price FROM hotels WHERE id = $1', [hotel_id]);
      if (hotelRes.rows.length === 0) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }

      const userId = req.user.id;

      const insertQuery = `
        INSERT INTO bookings (
          hotel_id,
          user_id,
          guest_name,
          guest_email,
          guest_phone,
          check_in,
          check_out,
          guests_count,
          total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;

      const values = [
        hotel_id,
        userId,
        guest_name.trim(),
        guest_email.trim(),
        guest_phone.trim(),
        check_in,
        check_out,
        numGuests,
        numTotal,
      ];

      const result = await pool.query(insertQuery, values);
      const newBooking = result.rows[0];

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully!',
        booking: {
          ...newBooking,
          hotel_title: hotelRes.rows[0].title,
        },
      });
    } catch (err) {
      console.error('Booking creation error:', err);
      return res.status(500).json({ error: 'Server error while processing booking: ' + err.message });
    }
  },

  async getBookings(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let queryText = '';
      let params = [];

      if (userRole === 'admin') {
        queryText = `
          SELECT b.*, h.title as hotel_title, u.name as booked_by_user_name, u.email as booked_by_user_email
          FROM bookings b
          JOIN hotels h ON b.hotel_id = h.id
          LEFT JOIN users u ON b.user_id = u.id
          ORDER BY b.created_at DESC;
        `;
      } else {
        queryText = `
          SELECT b.*, h.title as hotel_title
          FROM bookings b
          JOIN hotels h ON b.hotel_id = h.id
          WHERE b.user_id = $1
          ORDER BY b.created_at DESC;
        `;
        params = [userId];
      }

      const result = await pool.query(queryText, params);
      return res.status(200).json({ success: true, bookings: result.rows });
    } catch (err) {
      console.error('Fetch bookings error:', err);
      return res.status(500).json({ error: 'Server error while fetching bookings: ' + err.message });
    }
  },
};

module.exports = bookingController;

