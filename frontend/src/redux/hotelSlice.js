import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hotelService from '../services/hotelService';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await hotelService.getHotels(filterParams);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch hotels.');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelService.getHotelById(id);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Hotel not found.');
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await hotelService.createHotel(formData);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to create hotel.');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await hotelService.updateHotel(id, formData);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update hotel.');
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelService.deleteHotel(id);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to delete hotel.');
    }
  }
);

const initialState = {
  hotels: [],
  selectedHotel: null,
  totalCount: 0,
  loading: false,
  error: null,
  notification: null,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    currentPage: 1,
    limit: 6,
  },
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.filters.search = action.payload;
      state.filters.currentPage = 1;
    },
    setPriceFilter: (state, action) => {
      state.filters.minPrice = action.payload.minPrice;
      state.filters.maxPrice = action.payload.maxPrice;
      state.filters.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.filters.currentPage = action.payload;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.hotels) {
          state.hotels = action.payload.hotels;
          state.totalCount = action.payload.totalCount;
        } else if (Array.isArray(action.payload)) {
          state.hotels = action.payload;
          state.totalCount = action.payload.length;
        } else {
          state.hotels = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hotels = [];
      })


      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createHotel.fulfilled, (state, action) => {
        state.notification = {
          type: 'success',
          message: 'Hotel created successfully!',
        };
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to create hotel.',
        };
      })

      .addCase(updateHotel.fulfilled, (state, action) => {
        state.notification = {
          type: 'success',
          message: 'Hotel updated successfully!',
        };
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to update hotel.',
        };
      })

      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.notification = {
          type: 'success',
          message: action.payload?.message || 'Hotel deleted successfully!',
        };
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to delete hotel.',
        };
      });
  },
});

export const {
  setSearchQuery,
  setPriceFilter,
  setCurrentPage,
  setNotification,
  clearNotification,
  clearSelectedHotel,
} = hotelSlice.actions;

export default hotelSlice.reducer;