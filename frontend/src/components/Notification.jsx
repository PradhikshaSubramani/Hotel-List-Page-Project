import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotification } from '../redux/hotelSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.hotels.notification);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  return (
    <div className={`toast ${notification.type}`}>
      {notification.message}
    </div>
  );
};

export default Notification;