// components/QuickFilters.js
import React from 'react';

const QuickFilters = ({ translations }) => {
  const filters = [
    { id: 'scooters', name: 'Scooters', icon: '🛵' },
    { id: 'trail', name: 'Trail', icon: '🏍️' },
    { id: 'classic', name: 'Classic', icon: '🏍️' },
    { id: 'sport', name: 'Sport', icon: '🏁' },
    { id: 'cruiser', name: 'Cruiser', icon: '🛣️' },
    { id: 'electric', name: 'Electric', icon: '⚡' }
  ];

  return (
    <section className="quick-filters">
      <div className="container">
        <h3>Quick Filters</h3>
        <div className="filters-grid">
          {filters.map(filter => (
            <button key={filter.id} className="filter-btn">
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-name">{filter.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;
