import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import hotelService from '../services/hotelService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';
import { setNotification } from '../redux/hotelSlice';
import MapView from '../components/MapView';

const StarIcon = ({ filled = false, size = 18, color = '#f5a623', emptyColor = '#dee2e6' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : emptyColor}
    stroke={filled ? color : emptyColor}
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRatingDisplay = ({ rating = 0, maxStars = 5, size = 18 }) => {
  const roundedRating = Math.round(rating);
  return (
    <div style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[...Array(maxStars)].map((_, i) => (
        <StarIcon key={i} filled={i < roundedRating} size={size} />
      ))}
    </div>
  );
};

const InteractiveStarRating = ({ rating, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const ratingDescriptions = {
    1: '1 - Poor',
    2: '2 - Fair',
    3: '3 - Good',
    4: '4 - Very Good',
    5: '5 - Excellent',
  };

  const activeValue = hoverRating || rating;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
      <div
        style={{ display: 'inline-flex', gap: '4px' }}
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = starVal <= activeValue;
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onChange(starVal)}
              onMouseEnter={() => setHoverRating(starVal)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                lineHeight: 1,
                borderRadius: '2px',
              }}
              aria-label={`Rate ${starVal} out of 5 stars`}
            >
              <StarIcon filled={isFilled} size={26} />
            </button>
          );
        })}
      </div>
      <span style={{ fontSize: '0.9rem', color: '#495057', fontWeight: 600 }}>
        {ratingDescriptions[activeValue] || ''}
      </span>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

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

  // Reviews and ratings state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const data = await reviewService.getReviews(id);
      setReviews(data.reviews || []);
      setTotalReviews(data.totalReviews || 0);
      setAverageRating(parseFloat(data.averageRating) || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating || newRating < 1 || newRating > 5) {
      setReviewError('Please select a star rating between 1 and 5.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please provide your feedback comment.');
      return;
    }

    setSubmitReviewLoading(true);
    setReviewError('');

    try {
      await reviewService.createReview(id, {
        rating: newRating,
        comment: newComment.trim(),
      });

      setNewComment('');
      setNewRating(5);
      dispatch(
        setNotification({
          type: 'success',
          message: 'Review submitted successfully!',
        })
      );
      await fetchReviews();
    } catch (err) {
      setReviewError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitReviewLoading(false);
    }
  };

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
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/hotels')}>
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
          onClick={() => navigate('/hotels')}
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

        {/* Guest Reviews & Ratings Section — visible to regular users only */}
        {user?.role === 'user' && (
        <><hr style={{ border: 'none', borderTop: '1px solid #dee2e6', margin: '2.5rem 0 2rem 0' }} />

        <section aria-label="Guest Reviews and Ratings">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', color: '#212529', margin: 0, fontWeight: 700 }}>
              Guest Reviews & Ratings
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <StarRatingDisplay rating={averageRating} size={20} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0056b3' }}>
                {totalReviews > 0 ? `${averageRating.toFixed(1)} / 5` : 'New'}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Average Rating Summary Banner */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6c757d',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Overall Guest Satisfaction
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0056b3', lineHeight: 1 }}>
                  {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
                </span>
                <span style={{ fontSize: '1.1rem', color: '#6c757d', fontWeight: 500 }}>/ 5</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <StarRatingDisplay rating={averageRating} size={22} />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#495057' }}>
                {totalReviews > 0
                  ? `Based on ${totalReviews} verified guest ${totalReviews === 1 ? 'review' : 'reviews'}`
                  : 'No reviews submitted yet'}
              </span>
            </div>
          </div>

          {/* Submit Rating & Feedback Form */}
          <div
              style={{
                background: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', color: '#0056b3', marginBottom: '0.35rem', fontWeight: 700 }}>
                Write a Review
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '1.25rem' }}>
                Sharing your experience as <strong>{user.name}</strong> ({user.email})
              </p>

              {reviewError && (
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
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#2c3e50',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Select Your Rating
                  </label>
                  <InteractiveStarRating rating={newRating} onChange={setNewRating} />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label
                    htmlFor="hotel-review-comment"
                    style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#2c3e50',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Feedback & Comments
                  </label>
                  <textarea
                    id="hotel-review-comment"
                    rows="3"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (reviewError) setReviewError('');
                    }}
                    placeholder="Describe your stay, service quality, rooms, cleanliness, and amenities..."
                    required
                    disabled={submitReviewLoading}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitReviewLoading || !newComment.trim()}
                    style={{ padding: '0.65rem 1.6rem', fontWeight: 600, minWidth: '140px' }}
                  >
                    {submitReviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>

          {/* Public / Shared Reviews List */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#212529', marginBottom: '1rem', fontWeight: 700 }}>
              All Guest Feedback ({totalReviews})
            </h3>

            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                Loading guest reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  background: '#f8f9fa',
                  border: '1px dashed #dee2e6',
                  borderRadius: '8px',
                  color: '#6c757d',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem', color: '#495057' }}>
                  No reviews yet
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  Be the first guest to share your rating and feedback for {hotel.title}!
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#0056b3',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            flexShrink: 0,
                          }}
                        >
                          {(rev.user_name || rev.reviewer_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#212529', fontSize: '0.95rem' }}>
                            {rev.user_name || rev.reviewer_name || 'Guest User'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {formatDate(rev.created_at)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <StarRatingDisplay rating={rev.rating} size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
                          {rev.rating} / 5
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: '#495057',
                        fontSize: '0.925rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        </>
        )}
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
