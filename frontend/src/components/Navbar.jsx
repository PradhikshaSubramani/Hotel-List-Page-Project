import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { setNotification } from '../redux/hotelSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const isLoggedIn = Boolean(token && user);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      setNotification({
        type: 'success',
        message: 'You have been logged out successfully.',
      })
    );
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
        <Link to="/" className="logo">
          Hotel Explorer
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
            }}
          >
            Home
          </Link>
          <Link
            to="/hotels"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
            }}
          >
            Hotels
          </Link>
          <Link
            to="/about"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
            }}
          >
            About Us
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <>
                <Link to="/bookings" className="btn-add">
                  Bookings
                </Link>
                <Link to="/add" className="btn-add">
                  Add New Hotel
                </Link>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                  backgroundColor: isAdmin ? '#ffc107' : '#28a745',
                  color: isAdmin ? '#212529' : '#ffffff',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.4rem 0.85rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '0.4rem 0.8rem',
              }}
            >
              Login
            </Link>
            <Link to="/register" className="btn-add">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
