import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { loginUser, clearAuthError } from '../redux/authSlice';
import { setNotification } from '../redux/hotelSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, loading, error: authError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const redirectPath = location.state?.from || '/';

  useEffect(() => {
    dispatch(clearAuthError());
    if (token) {
      navigate(redirectPath, { replace: true });
    }
  }, [token, navigate, redirectPath, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      dispatch(clearAuthError());
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      dispatch(
        setNotification({
          type: 'success',
          message: 'Welcome back! Login successful.',
        })
      );
      navigate(redirectPath, { replace: true });
    } catch (err) {
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Hotel Explorer</title>
        <meta name="description" content="Login to Hotel Explorer to view hotels, make bookings, or manage listings." />
      </Helmet>

      <div className="container">
        <div className="form-container">
          <h2 className="form-title" style={{ textAlign: 'center' }}>
            Welcome Back
          </h2>

          {location.state?.message && !authError && (
            <div
              style={{
                background: '#e7f1ff',
                color: '#0056b3',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              {location.state.message}
            </div>
          )}

          {authError && (
            <div
              className="error-msg"
              style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.email && <span className="error-msg">{validationErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.password && <span className="error-msg">{validationErrors.password}</span>}
            </div>

            <div className="form-group">
              <label>Select Login Role</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  User
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  Admin
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <span>Don't have an account? </span>
            <Link to="/register" style={{ color: '#0056b3', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

