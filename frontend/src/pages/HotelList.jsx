import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel, setSearchQuery, setPriceFilter, setCurrentPage } from '../redux/hotelSlice';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import PriceFilter from '../components/PriceFilter';
import Pagination from '../components/Pagination';
import DeleteModal from '../components/DeleteModal';

const HotelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotels = [], totalCount = 0, loading = false, error = null, filters } = useSelector(
    (state) => state.hotels || {}
  );

  const safeFilters = filters || {
    search: '',
    minPrice: '',
    maxPrice: '',
    currentPage: 1,
    limit: 6,
  };

  const [localSearch, setLocalSearch] = useState(safeFilters.search || '');
  const [localMinPrice, setLocalMinPrice] = useState(safeFilters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(safeFilters.maxPrice || '');

  const [hotelToDelete, setHotelToDelete] = useState(null);

  // Fetch when filters or page changes
  useEffect(() => {
    const offset = ((safeFilters.currentPage || 1) - 1) * (safeFilters.limit || 6);
    dispatch(
      fetchHotels({
        search: safeFilters.search || '',
        minPrice: safeFilters.minPrice || '',
        maxPrice: safeFilters.maxPrice || '',
        limit: safeFilters.limit || 6,
        offset,
      })
    );
  }, [dispatch, safeFilters.currentPage, safeFilters.search, safeFilters.minPrice, safeFilters.maxPrice, safeFilters.limit]);

  // Live Search
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    dispatch(setSearchQuery(value));
  };

  // Price Filter Handlers
  const handlePriceChange = (field, value) => {
    if (field === 'minPrice') setLocalMinPrice(value);
    if (field === 'maxPrice') setLocalMaxPrice(value);
  };

  const handleApplyPrice = () => {
    dispatch(setPriceFilter({ minPrice: localMinPrice, maxPrice: localMaxPrice }));
  };

  const handleResetPrice = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    dispatch(setPriceFilter({ minPrice: '', maxPrice: '' }));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (hotelToDelete) {
      await dispatch(deleteHotel(hotelToDelete.id));
      setHotelToDelete(null);
      const offset = ((safeFilters.currentPage || 1) - 1) * (safeFilters.limit || 6);
      dispatch(fetchHotels({ ...safeFilters, offset }));
    }
  };

  const hotelList = Array.isArray(hotels) ? hotels : [];
  const totalPages = Math.ceil((totalCount || 0) / (safeFilters.limit || 6));

  return (
    <>
      <Helmet>
        <title>Explore Luxury & Budget Hotels | Hotel Explorer</title>
        <meta
          name="description"
          content="Browse, search, and discover the best luxury and budget accommodations with real-time pricing and interactive maps."
        />
      </Helmet>

      <div className="container">
        <div className="main-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <h3>Filters & Search</h3>
            <SearchBar search={localSearch} onSearchChange={handleSearchChange} />
            <PriceFilter
              minPrice={localMinPrice}
              maxPrice={localMaxPrice}
              onPriceChange={handlePriceChange}
              onApply={handleApplyPrice}
              onReset={handleResetPrice}
            />
          </aside>

          {/* Main Content Area */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2>Available Accommodations</h2>
              <span style={{ color: '#6c757d', fontWeight: 600 }}>
                {totalCount} {totalCount === 1 ? 'hotel' : 'hotels'} found
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading hotels...</div>
            ) : error ? (
              <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>
            ) : hotelList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(4px)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}>
                <h3>No hotels found matching your criteria.</h3>
                <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>Try clearing filters or search terms.</p>
              </div>
            ) : (
              <>
                <div className="cards-grid">
                  {hotelList.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onEdit={(id) => navigate(`/edit/${id}`)}
                      onDelete={(item) => setHotelToDelete(item)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={safeFilters.currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>
        </div>
      </div>

      <DeleteModal
        isOpen={Boolean(hotelToDelete)}
        hotelTitle={hotelToDelete?.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setHotelToDelete(null)}
      />
    </>
  );
};

export default HotelList;