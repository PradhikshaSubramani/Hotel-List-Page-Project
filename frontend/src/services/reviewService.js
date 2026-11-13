import api from './api';

const reviewService = {
  async getReviews(hotelId) {
    const response = await api.get(`/hotels/${hotelId}/reviews`);
    return response.data;
  },

  async createReview(hotelId, reviewData) {
    const response = await api.post(`/hotels/${hotelId}/reviews`, reviewData);
    return response.data;
  },
};

export default reviewService;

