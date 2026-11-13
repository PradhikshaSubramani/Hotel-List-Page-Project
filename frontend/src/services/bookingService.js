import api from './api';

const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getBookings() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getAllBookingsAdmin() {
    const response = await api.get('/bookings/all');
    return response.data;
  },
};

export default bookingService;

