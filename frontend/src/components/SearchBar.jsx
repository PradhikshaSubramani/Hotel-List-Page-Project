import React from 'react';

const SearchBar = ({ search, onSearchChange }) => {
  return (
    <div className="filter-group">
      <label htmlFor="search-input">Search by Hotel Name</label>
      <input
        id="search-input"
        type="text"
        placeholder="Type to search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;