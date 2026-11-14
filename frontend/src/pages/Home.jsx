import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Hotel Explorer | Find Your Perfect Stay</title>
      </Helmet>

      <div
        className="container"
        style={{
          maxWidth: '820px',
          margin: '3.5rem auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          padding: '3rem 2.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '2.2rem',
            color: '#212529',
            marginBottom: '0.85rem',
            fontWeight: 700,
          }}
        >
          Welcome to Hotel Explorer
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#495057',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Discover and book comfortable stays with ease.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2.5rem',
          }}
        >
          <Link
            to="/hotels"
            className="btn btn-primary"
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.05rem',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Explore Hotels
          </Link>
        </div>

        <div
          style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
          }}
        >
          <div style={{ padding: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0056b3', marginBottom: '0.4rem', fontWeight: 600 }}>
              Curated Accommodations
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0, lineHeight: 1.5 }}>
              Browse verified hotels and executive suites tailored to your travel preferences and budget.
            </p>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0056b3', marginBottom: '0.4rem', fontWeight: 600 }}>
              Verified Guest Reviews
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0, lineHeight: 1.5 }}>
              Check genuine feedback, ratings, and experience reports from guests before booking.
            </p>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0056b3', marginBottom: '0.4rem', fontWeight: 600 }}>
              Interactive Map Locations
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0, lineHeight: 1.5 }}>
              Inspect precise geographic coordinates and explore surrounding neighborhoods on live maps.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

