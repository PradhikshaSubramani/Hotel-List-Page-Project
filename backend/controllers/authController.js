const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authController = {
  // 1. Register User or Admin
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const assignedRole = (role || 'user').toLowerCase().trim();
      if (assignedRole !== 'user' && assignedRole !== 'admin') {
        return res.status(400).json({ error: "Invalid role. Role must be 'user' or 'admin'." });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const insertQuery = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at;
      `;
      const result = await pool.query(insertQuery, [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        assignedRole,
      ]);

      const newUser = result.rows[0];

      // Sign JWT token
      const token = jwt.sign(
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        process.env.JWT_SECRET || 'hotel_secret_key_jwt_123',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Server error during registration: ' + err.message });
    }
  },

  // 2. Login with role verification
  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role selection are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const selectedRole = role.toLowerCase().trim();

      // Fetch user by email
      const result = await pool.query(
        'SELECT id, name, email, password, role FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Strictly verify that selected role matches user.role
      if (user.role.toLowerCase() !== selectedRole) {
        return res.status(403).json({
          error: `Selected role '${selectedRole}' does not match registered account role '${user.role}'. Please select '${user.role}' to proceed.`,
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'hotel_secret_key_jwt_123',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error during login: ' + err.message });
    }
  },

  // 3. Current user details
  async getMe(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
      console.error('getMe error:', err);
      return res.status(500).json({ error: 'Server error: ' + err.message });
    }
  },
};

module.exports = authController;

