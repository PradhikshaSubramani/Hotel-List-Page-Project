import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hotelService from '../services/hotelService';

// 1. Async Thunk: Fetch Hotels with Filters & Pagination
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await hotelService.getHotels(filterParams);
      // response.data irundha edukkum, illana direct response
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch hotels.');
    }
  }
);

// 2. Async Thunk: Fetch Single Hotel Details
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

// 3. Async Thunk: Create Hotel
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

// 4. Async Thunk: Update Hotel
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

// 5. Async Thunk: Delete Hotel
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
      // Fetch Hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { hotels: [...], totalCount: 8 }
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

      // Fetch Hotel By Id
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

      // Create Hotel
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

      // Update Hotel
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

      // Delete Hotel
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