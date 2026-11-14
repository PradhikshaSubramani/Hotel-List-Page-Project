import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Hotel Explorer</title>
      </Helmet>

      <div
        className="container"
        style={{
          maxWidth: '850px',
          margin: '3.5rem auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          padding: '2.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h1
          style={{
            fontSize: '1.9rem',
            color: '#212529',
            marginBottom: '1rem',
            fontWeight: 700,
            borderBottom: '2px solid #e7f1ff',
            paddingBottom: '0.75rem',
          }}
        >
          About Our Platform
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#495057',
            lineHeight: 1.7,
            marginBottom: '1.25rem',
          }}
        >
          Hotel Explorer is a clean, reliable hotel listing and reservation platform created to make finding and booking accommodations straightforward. Whether planning a quick business trip or a leisure stay, our platform brings together essential property details in one accessible place.
        </p>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#495057',
            lineHeight: 1.7,
            marginBottom: '1.25rem',
          }}
        >
          Our application helps users explore curated hotel listings, check interactive map locations and precise coordinates, read genuine guest ratings and feedback, and submit bookings with clear, upfront pricing.
        </p>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#495057',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}
        >
          For administrators, the platform provides dedicated management features to maintain hotel listings, monitor incoming reservations, and ensure smooth operational handling.
        </p>

        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', color: '#0056b3', marginBottom: '0.6rem', fontWeight: 600 }}>
            Core Platform Highlights
          </h3>
          <ul style={{ color: '#495057', paddingLeft: '1.25rem', lineHeight: 1.7, margin: 0 }}>
            <li>Browse comprehensive hotel profiles with high-resolution image strips and descriptions.</li>
            <li>Interactive map viewer powered by Leaflet to inspect exact hotel locations.</li>
            <li>Role-based user authentication ensuring secure reservations and review submissions.</li>
            <li>Transparent guest ratings with 1-to-5 star evaluation criteria.</li>
            <li>Dedicated administrative dashboard for centralized booking oversight.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/hotels"
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.6rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Explore Hotels
          </Link>
          <Link
            to="/"
            className="btn"
            style={{
              background: '#e9ecef',
              color: '#333',
              padding: '0.65rem 1.6rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default About;

