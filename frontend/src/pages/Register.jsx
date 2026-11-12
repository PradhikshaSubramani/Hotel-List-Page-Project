import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { registerUser, clearAuthError } from '../redux/authSlice';
import { setNotification } from '../redux/hotelSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, loading, error: authError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
    if (token) {
      navigate('/');
    }
  }, [token, navigate, dispatch]);

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
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
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
      await dispatch(registerUser(formData)).unwrap();
      dispatch(
        setNotification({
          type: 'success',
          message: 'Account created successfully! Welcome to Hotel Explorer.',
        })
      );
      navigate('/');
    } catch (err) {
      // Redux sets authError
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up | Hotel Explorer</title>
        <meta name="description" content="Create a new account on Hotel Explorer as a User or Hotel Admin." />
      </Helmet>

      <div className="container">
        <div className="form-container">
          <h2 className="form-title" style={{ textAlign: 'center' }}>
            Create an Account
          </h2>

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
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.name && <span className="error-msg">{validationErrors.name}</span>}
            </div>

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
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.password && <span className="error-msg">{validationErrors.password}</span>}
            </div>

            <div className="form-group">
              <label>Select Your Role</label>
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
                  User (Book Accommodations)
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
                  Admin (Manage Listings)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <span>Already have an account? </span>
            <Link to="/login" style={{ color: '#0056b3', fontWeight: 600, textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

