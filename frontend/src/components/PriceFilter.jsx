import React from 'react';

const PriceFilter = ({ minPrice, maxPrice, onPriceChange, onApply, onReset }) => {
  return (
    <div className="filter-group">
      <label>Price Range (₹)</label>
      <div className="price-inputs">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => onPriceChange('minPrice', e.target.value)}
        />
        <span>-</span>
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => onPriceChange('maxPrice', e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onApply}>
          Apply
        </button>
        <button
          className="btn"
          style={{ background: '#e2e6ea', color: '#333' }}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;