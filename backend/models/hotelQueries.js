const db = require('../config/db');

const hotelQueries = {
  async create({ title, description, price, latitude, longitude, images }) {
    const query = `
      INSERT INTO hotels (title, description, price, latitude, longitude, images)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [title, description, price, latitude, longitude, images];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findAll({ search, minPrice, maxPrice, limit = 6, offset = 0 }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      conditions.push(`title ILIKE $${paramIndex}`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      conditions.push(`price >= $${paramIndex}`);
      values.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      conditions.push(`price <= $${paramIndex}`);
      values.push(parseFloat(maxPrice));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM hotels
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const { rows } = await db.query(query, values);
    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    return { hotels: rows, totalCount };
  },

  async findById(id) {
    const query = `SELECT * FROM hotels WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async update(id, { title, description, price, latitude, longitude, images }) {
    const query = `
      UPDATE hotels
      SET 
        title = $1,
        description = $2,
        price = $3,
        latitude = $4,
        longitude = $5,
        images = COALESCE($6, images),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const values = [title, description, price, latitude, longitude, images, id];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    const query = `DELETE FROM hotels WHERE id = $1 RETURNING id, images;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
};

module.exports = hotelQueries;