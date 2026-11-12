import api from './api';

const hotelService = {
  async getHotels({ search = '', minPrice = '', maxPrice = '', offset = 0, limit = 6 } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (minPrice !== '') params.append('minPrice', minPrice);
    if (maxPrice !== '') params.append('maxPrice', maxPrice);
    params.append('offset', offset);
    params.append('limit', limit);

    const response = await api.get(`/hotels?${params.toString()}`);
    return response.data;
  },

  async getHotelById(id) {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  async createHotel(formData) {
    const response = await api.post('/hotels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateHotel(id, formData) {
    const response = await api.put(`/hotels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteHotel(id) {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
};

export default hotelService;
