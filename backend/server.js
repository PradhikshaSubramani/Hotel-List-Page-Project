const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { pool, initDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from /uploads route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Hotel Management API is active.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler (e.g., Multer file size/type errors)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'An unexpected error occurred.' });
  }
  next();
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    // Quick test query on boot
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', res.rows[0].now);
    await initDB();
  } catch (err) {
    console.error('Database connection failed on startup:', err.message);
  }
});