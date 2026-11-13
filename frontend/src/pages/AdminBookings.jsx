import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import bookingService from '../services/bookingService';
import { setNotification } from '../redux/hotelSlice';

const AdminBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      dispatch(
        setNotification({
          type: 'error',
          message: 'Access denied: Admin privileges required.',
        })
      );
      navigate('/');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingService.getAllBookingsAdmin();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
        const errMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to load bookings. Please check your admin privileges.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token, navigate, dispatch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateNights = (inDateStr, outDateStr) => {
    if (!inDateStr || !outDateStr) return 0;
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const hotelMatch = (b.hotel_name || b.hotel_title || '').toLowerCase().includes(term);
    const guestMatch = (b.guest_name || '').toLowerCase().includes(term);
    const emailMatch = (b.guest_email || '').toLowerCase().includes(term);
    const phoneMatch = (b.guest_phone || '').toLowerCase().includes(term);
    const idMatch = String(b.id).includes(term);
    return hotelMatch || guestMatch || emailMatch || phoneMatch || idMatch;
  });

  return (
    <>
      <Helmet>
        <title>All Hotel Bookings | Admin Dashboard</title>
      </Helmet>

      <div
        className="container"
        style={{
          maxWidth: '1240px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(4px)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
      >
        <button
          className="btn"
          style={{ background: '#e9ecef', color: '#333', marginBottom: '1.5rem' }}
          onClick={() => navigate('/')}
        >
          ← Back to Listings
        </button>

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '2px solid #e7f1ff',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#212529', margin: 0, fontWeight: 700 }}>
              All Hotel Bookings
            </h1>
            <p style={{ color: '#6c757d', margin: '0.35rem 0 0 0', fontSize: '0.95rem' }}>
              Comprehensive log of guest reservations across all properties.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '20px',
              backgroundColor: '#e7f1ff',
              color: '#0056b3',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: '1px solid #b8daff',
            }}
          >
            <span>Total Bookings:</span>
            <span style={{ fontSize: '1.1rem' }}>{bookings.length}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search bookings by guest name, email, phone, hotel, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            className="error-msg"
            style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d', fontSize: '1.05rem' }}>
            Loading bookings records...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: '#f8f9fa',
              border: '1px dashed #dee2e6',
              borderRadius: '8px',
              color: '#6c757d',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#495057', marginBottom: '0.5rem' }}>
              {searchTerm ? 'No bookings matched your search query.' : 'No bookings found yet.'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              {searchTerm
                ? 'Try searching with a different name, email, or property title.'
                : 'Customer reservations will appear here once bookings are placed.'}
            </p>
          </div>
        ) : (
          /* Bookings Table */
          <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #dee2e6' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.925rem',
                backgroundColor: '#ffffff',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Guest Information</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Hotel Property</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Stay Dates</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Guests</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Total Price</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 700 }}>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b, index) => {
                  const nights = calculateNights(b.check_in, b.check_out);
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc',
                      }}
                    >
                      {/* Booking ID */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0056b3' }}>
                        #{b.id}
                      </td>

                      {/* Guest Details */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#212529' }}>{b.guest_name}</div>
                        <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>{b.guest_email}</div>
                        <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>Tel: {b.guest_phone}</div>
                      </td>

                      {/* Hotel Name & Location */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#212529' }}>
                          {b.hotel_name || b.hotel_title || `Hotel #${b.hotel_id}`}
                        </div>
                        {b.hotel_latitude && b.hotel_longitude && (
                          <div style={{ color: '#6c757d', fontSize: '0.825rem' }}>
                            Coordinates: {b.hotel_latitude}, {b.hotel_longitude}
                          </div>
                        )}
                        {b.hotel_nightly_price && (
                          <div style={{ color: '#0056b3', fontSize: '0.825rem', fontWeight: 500 }}>
                            ₹{parseFloat(b.hotel_nightly_price).toLocaleString('en-IN')} / night
                          </div>
                        )}
                      </td>

                      {/* Stay Dates */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: '#212529', fontWeight: 500 }}>
                          {formatDate(b.check_in)} → {formatDate(b.check_out)}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: '0.825rem' }}>
                          {nights} {nights === 1 ? 'night' : 'nights'}
                        </div>
                      </td>

                      {/* Guests Count */}
                      <td style={{ padding: '0.85rem 1rem', color: '#495057', fontWeight: 500 }}>
                        {b.guests_count} {b.guests_count === 1 ? 'Guest' : 'Guests'}
                      </td>

                      {/* Total Price */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0056b3' }}>
                        ₹{parseFloat(b.total_price || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                          }}
                        >
                          Confirmed
                        </span>
                      </td>

                      {/* Booked Date */}
                      <td style={{ padding: '0.85rem 1rem', color: '#6c757d', fontSize: '0.85rem' }}>
                        {formatDate(b.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminBookings;

