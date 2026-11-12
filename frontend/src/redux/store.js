import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from './hotelSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    hotels: hotelReducer,
    auth: authReducer,
  },
});

export default store;
