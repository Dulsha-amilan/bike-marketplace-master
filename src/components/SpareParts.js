// components/SpareParts.js
import React, { useEffect, useMemo, useState } from 'react';
import { getSpareParts } from '../api/bikeApi';
import './SpareParts.css';

const SpareParts = ({ translations }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    brand: '',
    compatibility: '',
    condition: ''
  });
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    getSpareParts()
      .then((list) => {
        if (!mounted) return;
        setParts(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError('Failed to load spare parts. Is the backend running?');
        setParts([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', name: translations.allCategories, icon: '🔧' },
    { id: 'engine', name: translations.engineParts, icon: '🔧' },
    { id: 'tyres', name: translations.tyresRims, icon: '🛞' },
    { id: 'electrical', name: translations.lightsElectrical, icon: '💡' },
    { id: 'chains', name: translations.chainsSprockets, icon: '⛓️' },
    { id: 'accessories', name: translations.seatsTanksMirrors, icon: '🪑' }
  ];

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const categoryMatch = activeCategory === 'all' || part.category === activeCategory;
      const brandMatch =
        !filters.brand ||
        String(part.brand || '')
          .toLowerCase()
          .includes(filters.brand.toLowerCase());
      const compatibilityMatch =
        !filters.compatibility ||
        String(part.compatibility || '')
          .toLowerCase()
          .includes(filters.compatibility.toLowerCase());
      const conditionMatch = !filters.condition || part.condition === filters.condition;

      return categoryMatch && brandMatch && compatibilityMatch && conditionMatch;
    });
  }, [parts, activeCategory, filters]);

  return (
    <div className="spare-parts">
      {/* Hero Section */}
      <section className="spare-parts-hero">
        <div className="container">
          <h1 className="hero-title">{translations.sparePartsTitle}</h1>
          <p className="hero-subtitle">{translations.sparePartsSubtitle}</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filters-section">
        <div className="container">
          <div className="filter-controls">
            <div className="filter-group">
              <label>{translations.brand}</label>
              <select 
                value={filters.brand} 
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
              >
                <option value="">{translations.allBrands}</option>
                <option value="Honda">Honda</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Bajaj">Bajaj</option>
                <option value="TVS">TVS</option>
                <option value="Hero">Hero</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>{translations.compatibility}</label>
              <input 
                type="text" 
                placeholder={translations.compatibilityPlaceholder}
                value={filters.compatibility}
                onChange={(e) => setFilters({...filters, compatibility: e.target.value})}
              />
            </div>
            
            <div className="filter-group">
              <label>{translations.condition}</label>
              <select 
                value={filters.condition} 
                onChange={(e) => setFilters({...filters, condition: e.target.value})}
              >
                <option value="">{translations.allConditions}</option>
                <option value="new">{translations.new}</option>
                <option value="used">{translations.used}</option>
                <option value="refurbished">{translations.refurbished}</option>
              </select>
            </div>
            
            <button className="reset-filters" onClick={() => setFilters({brand: '', compatibility: '', condition: ''})}>
              {translations.resetFilters}
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>{translations.categories}</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Parts Listing */}
      <section className="parts-listing">
        <div className="container">
          <div className="listing-header">
            <h3>{translations.availableParts} ({filteredParts.length})</h3>
            <div className="sort-controls">
              <select>
                <option>{translations.sortBy}</option>
                <option>{translations.priceAsc}</option>
                <option>{translations.priceDesc}</option>
                <option>{translations.newest}</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: 12, background: '#fff3cd', borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ padding: 12, opacity: 0.8 }}>{translations.loading || 'Loading…'}</div>
          )}
          
          <div className="parts-grid">
            {filteredParts.map(part => (
              <div key={part.id} className="part-card">
                <div className="part-image">
                  <img src={part.image} alt={part.name} />
                  <div className="part-condition">{translations[part.condition]}</div>
                </div>
                <div className="part-details">
                  <h4 className="part-name">{part.name}</h4>
                  <p className="part-brand">{translations.brand}: {part.brand}</p>
                  <p className="part-compatibility">{translations.compatibleWith}: {part.compatibility}</p>
                  <p className="part-price">Rs. {part.price.toLocaleString()}</p>
                  <p className="part-location">📍 {part.location}</p>
                  <button className="contact-seller">{translations.contactSeller}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SpareParts;
