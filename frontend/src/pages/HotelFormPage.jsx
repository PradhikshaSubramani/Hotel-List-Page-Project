import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { createHotel, updateHotel, setNotification } from '../redux/hotelSlice';
import hotelService from '../services/hotelService';
import HotelForm from '../components/HotelForm';

const HotelFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !user) {
      dispatch(
        setNotification({
          type: 'error',
          message: 'Please login as an Admin to manage hotels.',
        })
      );
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (user.role !== 'admin') {
      dispatch(
        setNotification({
          type: 'error',
          message: 'Access denied: Admin privileges required.',
        })
      );
      navigate('/');
    }
  }, [token, user, navigate, dispatch]);

  const isEdit = Boolean(id);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      hotelService
        .getHotelById(id)
        .then((res) => {
          // Axios response wrap aagi irundha res.data edukkum
          const data = res?.data || res;
          setInitialData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load hotel for editing:', err);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await dispatch(updateHotel({ id, formData })).unwrap();
      } else {
        await dispatch(createHotel(formData)).unwrap();
      }
      navigate('/');
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>Loading existing hotel details...</h3>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit Hotel' : 'Add New Hotel'} | Hotel Explorer</title>
      </Helmet>

      <div className="container" style={{ maxWidth: '700px', marginTop: '2rem', marginBottom: '3rem' }}>
        <HotelForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      </div>
    </>
  );
};

export default HotelFormPage;