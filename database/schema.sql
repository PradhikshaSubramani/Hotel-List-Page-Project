DROP TABLE IF EXISTS hotels;
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude NUMERIC(9, 6) NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    image VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_title ON hotels(title);
CREATE INDEX idx_hotels_price ON hotels(price);

INSERT INTO hotels (title, description, price, latitude, longitude, image)
VALUES 
(
    'Grand Palace Heritage Hotel',
    'Experience colonial elegance with world-class hospitality, lush courtyard gardens, multi-cuisine dining, and luxury suites.',
    4500.00,
    10.790483,
    78.704672,
    '/uploads/seed-hotel-1.jpg'
),
(
    'Ocean View Bay Resort',
    'Breathtaking sunrise views over the shoreline featuring private beach access, infinity pool, and seafood barbecue terrace.',
    6200.00,
    13.082680,
    80.270718,
    '/uploads/seed-hotel-2.jpg'
),
(
    'Green Meadows Eco Villa',
    'A tranquil eco-friendly retreat surrounded by organic plantations, mountain air, private balconies, and open-air yoga shalas.',
    3200.00,
    11.410214,
    76.695038,
    '/uploads/seed-hotel-3.jpg'
),
(
    'Urban Transit Business Hotel',
    'Modern executive suites equipped with high-speed fiber internet, ergonomic workstations, 24/7 dining, and boardrooms.',
    2800.00,
    12.971598,
    77.594562,
    '/uploads/seed-hotel-4.jpg'
),
(
    'Pine Valley Hilltop Resort',
    'Perched atop rolling hills, offering mist-covered panoramic valley vistas, warm fireplaces, and guided trekking trails.',
    5500.00,
    10.238114,
    77.489182,
    '/uploads/seed-hotel-5.jpg'
),
(
    'Sunset Haven Boutique Hotel',
    'Intimate boutique accommodations offering customized concierge service, artisanal rooftop cocktails, and curated city tours.',
    3900.00,
    9.925201,
    78.119775,
    '/uploads/seed-hotel-6.jpg'
),
(
    'Royal Palms Budget Inn',
    'Affordable and spotless stays tailored for budget travelers and solo backpackers, located 5 minutes from the central station.',
    1200.00,
    10.850516,
    76.271083,
    '/uploads/seed-hotel-7.jpg'
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER NOT NULL CHECK (guests_count > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
