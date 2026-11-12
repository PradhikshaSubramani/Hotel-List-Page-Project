import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import hotelService from '../services/hotelService';
import bookingService from '../services/bookingService';
import { setNotification } from '../redux/hotelSlice';
import MapView from '../components/MapView';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [bookingData, setBookingData] = useState({
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests_count: 1,
  });

  useEffect(() => {
    if (!token || !user) {
      dispatch(
        setNotification({
          type: 'error',
          message: 'Please login to view hotel details',
        })
      );
      navigate('/login', {
        state: {
          from: `/hotels/${id}`,
          message: 'Please login to view hotel details',
        },
      });
    }
  }, [token, user, id, navigate, dispatch]);

  useEffect(() => {
    if (user) {
      setBookingData((prev) => ({
        ...prev,
        guest_name: prev.guest_name || user.name || '',
        guest_email: prev.guest_email || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    hotelService
      .getHotelById(id)
      .then((res) => {
        const data = res?.data || res;
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load hotel:', err);
        setHotel(null);
        setLoading(false);
      });
  }, [id]);

  const calculateNights = (inDateStr, outDateStr) => {
    if (!inDateStr || !outDateStr) return 0;
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const stayNights = calculateNights(bookingData.check_in, bookingData.check_out);
  const totalCalculatedPrice = stayNights > 0 ? stayNights * parseFloat(hotel?.price || 0) : 0;

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    if (bookingError) setBookingError('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.guest_name.trim() || !bookingData.guest_email.trim() || !bookingData.guest_phone.trim()) {
      setBookingError('Please fill out all contact fields.');
      return;
    }
    if (!bookingData.check_in || !bookingData.check_out) {
      setBookingError('Please select both check-in and check-out dates.');
      return;
    }
    if (stayNights <= 0) {
      setBookingError('Check-out date must be strictly after check-in date.');
      return;
    }
    if (parseInt(bookingData.guests_count, 10) < 1) {
      setBookingError('At least 1 guest is required.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await bookingService.createBooking({
        hotel_id: hotel.id,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        guest_phone: bookingData.guest_phone,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests_count: parseInt(bookingData.guests_count, 10),
        total_price: totalCalculatedPrice,
      });

      setShowBookingModal(false);
      dispatch(
        setNotification({
          type: 'success',
          message: `Booking confirmed successfully for ${hotel.title}!`,
        })
      );
    } catch (err) {
      setBookingError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to submit booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Hotel Not Found</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          Back to Listings
        </button>
      </div>
    );
  }

  let imagesList = [];
  if (Array.isArray(hotel.images) && hotel.images.length > 0) {
    imagesList = hotel.images;
  } else if (typeof hotel.images === 'string') {
    imagesList = hotel.images.replace(/[{}"']/g, '').split(',').filter(Boolean);
  } else if (hotel.image) {
    imagesList = [hotel.image];
  }

  const getFullImgUrl = (path) => {
    if (!path) return 'https://placehold.co/800x500/0056b3/ffffff?text=Hotel+Image';
    const clean = path.trim();
    return clean.startsWith('http') ? clean : `http://localhost:5000${clean.startsWith('/') ? '' : '/'}${clean}`;
  };

  const activeImage = imagesList[activeImageIndex]
    ? getFullImgUrl(imagesList[activeImageIndex])
    : 'https://placehold.co/800x500/0056b3/ffffff?text=Hotel+Image';

  return (
    <>
      <Helmet>
        <title>{hotel.title} | Hotel Explorer</title>
        <meta name="description" content={hotel.description ? hotel.description.substring(0, 150) : ''} />
      </Helmet>

      <div
        className="container"
        style={{
          maxWidth: '850px',
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

        {/* Hero Image */}
        <div style={{ width: '100%', height: '380px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
          <img
            src={activeImage}
            alt={hotel.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/800x500/0056b3/ffffff?text=Hotel+Image';
            }}
          />
        </div>

        {/* Thumbnail Gallery Strip */}
        {imagesList.length > 1 && (
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {imagesList.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '80px',
                  height: '60px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '2px solid #0056b3' : '1px solid #dee2e6',
                  opacity: activeImageIndex === idx ? 1 : 0.6,
                  transition: '0.2s all ease',
                }}
              >
                <img
                  src={getFullImgUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/80x60/0056b3/ffffff?text=Thumb';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#212529', margin: 0 }}>{hotel.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0056b3' }}>
              ₹{parseFloat(hotel.price || 0).toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: 400 }}>/ night</span>
            </span>
          </div>
        </div>

        {/* User Role "Book Hotel" Action Panel */}
        {user?.role === 'user' && (
          <div
            style={{
              background: '#e7f1ff',
              border: '1px solid #b8daff',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#0056b3', fontSize: '1.2rem' }}>Ready to reserve your stay?</h3>
              <p style={{ margin: '0.3rem 0 0 0', color: '#495057', fontSize: '0.9rem' }}>
                Book directly now with instant confirmation and flexible cancellation.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowBookingModal(true)}
              style={{ padding: '0.65rem 1.6rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Book Hotel
            </button>
          </div>
        )}

        <p style={{ color: '#495057', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
          {hotel.description}
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #dee2e6', margin: '2rem 0' }} />

        <h3 style={{ marginBottom: '0.5rem' }}>Location & Coordinates</h3>
        <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
          Latitude: <strong>{hotel.latitude}</strong> | Longitude: <strong>{hotel.longitude}</strong>
        </p>

        <MapView latitude={parseFloat(hotel.latitude)} longitude={parseFloat(hotel.longitude)} title={hotel.title} />
      </div>

      {/* Booking Form Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => !bookingLoading && setShowBookingModal(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '520px',
              textAlign: 'left',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #dee2e6',
                paddingBottom: '0.75rem',
              }}
            >
              <h3 style={{ margin: 0, color: '#0056b3', fontSize: '1.25rem' }}>
                Book Stay: {hotel.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.6rem',
                  cursor: 'pointer',
                  color: '#6c757d',
                  lineHeight: '1',
                }}
              >
                &times;
              </button>
            </div>

            {bookingError && (
              <div
                className="error-msg"
                style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Guest Full Name</label>
                <input
                  type="text"
                  name="guest_name"
                  value={bookingData.guest_name}
                  onChange={handleBookingChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              <div className="form-group">
                <label>Guest Email Address</label>
                <input
                  type="email"
                  name="guest_email"
                  value={bookingData.guest_email}
                  onChange={handleBookingChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="guest_phone"
                  placeholder="e.g. 9876543210"
                  value={bookingData.guest_phone}
                  onChange={handleBookingChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    name="check_in"
                    min={todayStr}
                    value={bookingData.check_in}
                    onChange={handleBookingChange}
                    required
                    disabled={bookingLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Check-out Date</label>
                  <input
                    type="date"
                    name="check_out"
                    min={bookingData.check_in || todayStr}
                    value={bookingData.check_out}
                    onChange={handleBookingChange}
                    required
                    disabled={bookingLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Number of Guests</label>
                <input
                  type="number"
                  name="guests_count"
                  min="1"
                  max="20"
                  value={bookingData.guests_count}
                  onChange={handleBookingChange}
                  required
                  disabled={bookingLoading}
                />
              </div>

              {/* Price Calculation Box */}
              <div
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '1rem',
                  margin: '1.25rem 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem',
                    fontSize: '0.9rem',
                    color: '#495057',
                  }}
                >
                  <span>Nightly Rate:</span>
                  <span>₹{parseFloat(hotel.price || 0).toLocaleString('en-IN')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem',
                    fontSize: '0.9rem',
                    color: '#495057',
                  }}
                >
                  <span>Stay Duration:</span>
                  <span>{stayNights} {stayNights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #dee2e6',
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    color: '#0056b3',
                  }}
                >
                  <span>Total Amount:</span>
                  <span>₹{totalCalculatedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#6c757d', color: 'white' }}
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading || stayNights <= 0}
                  style={{ minWidth: '130px' }}
                >
                  {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelDetails;
