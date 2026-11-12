const hotelQueries = require('../models/hotelQueries');
const fs = require('fs');
const path = require('path');

const cleanFiles = (files) => {
  if (files && files.length > 0) {
    files.forEach((file) => {
      const filePath = path.join(__dirname, '..', 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    });
  }
};

const deleteStoredImages = (images) => {
  if (Array.isArray(images)) {
    images.forEach((imgRelPath) => {
      const fullPath = path.join(__dirname, '..', imgRelPath);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
      }
    });
  }
};

const hotelController = {
  async createHotel(req, res) {
    const files = req.files || [];
    try {
      const { title, description, price, latitude, longitude } = req.body;

      if (!title || !description || !price || latitude === undefined || longitude === undefined) {
        cleanFiles(files);
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const numPrice = parseFloat(price);
      const numLat = parseFloat(latitude);
      const numLng = parseFloat(longitude);

      if (isNaN(numPrice) || numPrice <= 0) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Price must be a valid positive number.' });
      }

      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
      }

      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
      }

      if (files.length === 0) {
        return res.status(400).json({ error: 'At least one hotel image is required.' });
      }

      const imagePaths = files.map((file) => `/uploads/${file.filename}`);

      const newHotel = await hotelQueries.create({
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        latitude: numLat,
        longitude: numLng,
        images: imagePaths,
      });

      return res.status(201).json(newHotel);
    } catch (err) {
      cleanFiles(files);
      console.error('Create error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getHotels(req, res) {
    try {
      const { search, minPrice, maxPrice, limit, offset } = req.query;
      const result = await hotelQueries.findAll({
        search,
        minPrice,
        maxPrice,
        limit: limit ? parseInt(limit, 10) : 6,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getHotelById(req, res) {
    try {
      const { id } = req.params;
      const hotel = await hotelQueries.findById(id);
      if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }
      return res.status(200).json(hotel);
    } catch (err) {
      console.error('Fetch single error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateHotel(req, res) {
    const files = req.files || [];
    try {
      const { id } = req.params;
      const existingHotel = await hotelQueries.findById(id);

      if (!existingHotel) {
        cleanFiles(files);
        return res.status(404).json({ error: 'Hotel not found.' });
      }

      const { title, description, price, latitude, longitude } = req.body;
      const numPrice = parseFloat(price);
      const numLat = parseFloat(latitude);
      const numLng = parseFloat(longitude);

      if (isNaN(numPrice) || numPrice <= 0) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Price must be positive.' });
      }

      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
      }

      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        cleanFiles(files);
        return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
      }

      let newImagePaths = null;
      if (files.length > 0) {
        newImagePaths = files.map((file) => `/uploads/${file.filename}`);
        deleteStoredImages(existingHotel.images);
      }

      const updatedHotel = await hotelQueries.update(id, {
        title: title ? title.trim() : existingHotel.title,
        description: description ? description.trim() : existingHotel.description,
        price: numPrice,
        latitude: numLat,
        longitude: numLng,
        images: newImagePaths,
      });

      return res.status(200).json(updatedHotel);
    } catch (err) {
      cleanFiles(files);
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async deleteHotel(req, res) {
    try {
      const { id } = req.params;
      const deletedHotel = await hotelQueries.delete(id);

      if (!deletedHotel) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }

      deleteStoredImages(deletedHotel.images);

      return res.status(200).json({
        message: 'Hotel record and stored photos deleted successfully.',
        id: deletedHotel.id,
      });
    } catch (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

module.exports = hotelController;