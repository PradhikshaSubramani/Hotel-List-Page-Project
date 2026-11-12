# Full-Stack Hotel Management System (CRUD with Responsive UI)

A full-stack Single Page Application (SPA) built with React, Redux Toolkit, Node.js/Express, PostgreSQL, and Multer file upload.

##  Features
- Card-Based Responsive UI: Professional blue/white layout (strictly no HTML tables).
- Single Reusable Form: Unified Add/Edit form with client-side image preview and coordinate validation (-90 to 90 lat, -180 to 180 lng, price > 0).
- Search & Filtering: Dynamic case-insensitive title search combined with min/max price range filters.
- Server-Side Pagination: Native SQL pagination utilizing limit, offset, and window functions (`COUNT(*) OVER()`).
- Disk Storage & Cleanup: Images stored via Multer in local server storage; previous files cleaned up with `fs.unlink` on edit/delete.
- Interactive Map: Leaflet & OpenStreetMap rendering pinned coordinates on the Hotel Detail page.
- SEO & Accessibility: React Helmet meta tags and descriptive image alt attributes.

##  Tech Stack
- **Frontend:** React 18, Redux Toolkit, React Router DOM, React Helmet Async, Leaflet, Axios, CSS3.
- **Backend:** Node.js, Express.js, Multer, pg (PostgreSQL client), CORS, Dotenv.
- **Database:** PostgreSQL (Native SQL queries with parameterization, no ORM).

##  Installation & Setup

### 1. Database Setup
```bash
# Open psql terminal
psql -U postgres

# Create database and run schema
CREATE DATABASE hotel_management;
\c hotel_management
\i 'path/to/database/schema.sql'