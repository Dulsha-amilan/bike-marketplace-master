// components/BikerGear.js
import React, { useEffect, useMemo, useState } from 'react';
import { getBikerGear } from '../api/bikeApi';
import './BikerGear.css';

const BikerGear = ({ translations }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    size: '',
    brand: '',
    priceRange: '',
    condition: '',
    verifiedSeller: false
  });
  const [gear, setGear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    getBikerGear()
      .then((list) => {
        if (!mounted) return;
        setGear(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError('Failed to load biker gear. Is the backend running?');
        setGear([]);
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
    { id: 'all', name: translations.allCategories, icon: '🧢' },
    { id: 'helmets', name: translations.helmets, icon: '⛑️' },
    { id: 'gloves', name: translations.gloves, icon: '🧤' },
    { id: 'jackets', name: translations.jackets, icon: '🧥' },
    { id: 'boots', name: translations.boots, icon: '🥾' },
    { id: 'rainGear', name: translations.rainGear, icon: '🌧️' },
    { id: 'reflectiveVests', name: translations.reflectiveVests, icon: '🦺' }
  ];

  const helmetTypes = [
    { id: 'full', name: translations.fullFace, icon: '🛡️' },
    { id: 'half', name: translations.halfFace, icon: '🪖' },
    { id: 'modular', name: translations.modular, icon: '🔄' }
  ];

  const filteredGear = useMemo(() => {
    return gear.filter((item) => {
      const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
      const sizeMatch = !filters.size || item.size === filters.size;
      const brandMatch =
        !filters.brand ||
        String(item.brand || '')
          .toLowerCase()
          .includes(filters.brand.toLowerCase());
      const priceMatch = !filters.priceRange || checkPriceRange(item.price, filters.priceRange);
      const conditionMatch = !filters.condition || item.condition === filters.condition;
      const verifiedMatch = !filters.verifiedSeller || item.verifiedSeller;

      return categoryMatch && sizeMatch && brandMatch && priceMatch && conditionMatch && verifiedMatch;
    });
  }, [gear, activeCategory, filters]);

  const checkPriceRange = (price, range) => {
    switch (range) {
      case '0-5000': return price <= 5000;
      case '5000-15000': return price >= 5000 && price <= 15000;
      case '15000-30000': return price >= 15000 && price <= 30000;
      case '30000+': return price >= 30000;
      default: return true;
    }
  };

  return (
    <div className="biker-gear">
      {/* Hero Section */}
      <section className="gear-hero">
        <div className="container">
          <h1 className="hero-title">{translations.bikerGearTitle}</h1>
          <p className="hero-subtitle">{translations.bikerGearSubtitle}</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="gear-filters">
        <div className="container">
          <div className="filter-controls">
            <div className="filter-group">
              <label>{translations.size}</label>
              <select 
                value={filters.size} 
                onChange={(e) => setFilters({...filters, size: e.target.value})}
              >
                <option value="">{translations.allSizes}</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>{translations.brand}</label>
              <select 
                value={filters.brand} 
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
              >
                <option value="">{translations.allBrands}</option>
                <option value="HJC">HJC</option>
                <option value="Arai">Arai</option>
                <option value="Shoei">Shoei</option>
                <option value="AGV">AGV</option>
                <option value="Alpinestars">Alpinestars</option>
                <option value="Dainese">Dainese</option>
                <option value="Fox">Fox</option>
                <option value="Rev'it">Rev'it</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>{translations.priceRange}</label>
              <select 
                value={filters.priceRange} 
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              >
                <option value="">{translations.allPrices}</option>
                <option value="0-5000">Under Rs. 5,000</option>
                <option value="5000-15000">Rs. 5,000 - 15,000</option>
                <option value="15000-30000">Rs. 15,000 - 30,000</option>
                <option value="30000+">Above Rs. 30,000</option>
              </select>
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
              </select>
            </div>
            
            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.verifiedSeller}
                  onChange={(e) => setFilters({...filters, verifiedSeller: e.target.checked})}
                />
                <span className="checkmark"></span>
                {translations.verifiedSeller}
              </label>
            </div>
            
            <button 
              className="reset-filters" 
              onClick={() => setFilters({size: '', brand: '', priceRange: '', condition: '', verifiedSeller: false})}
            >
              {translations.resetFilters}
            </button>
          </div>
        </div>
      </section>

      {/* Helmet Types Section */}
      {activeCategory === 'helmets' && (
        <section className="helmet-types">
          <div className="container">
            <h3>{translations.helmetTypes}</h3>
            <div className="helmet-types-grid">
              {helmetTypes.map(type => (
                <div key={type.id} className="helmet-type-card">
                  <span className="helmet-icon">{type.icon}</span>
                  <h4>{type.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="gear-categories">
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

      {/* Gear Listing */}
      <section className="gear-listing">
        <div className="container">
          <div className="listing-header">
            <h3>{translations.availableGear} ({filteredGear.length})</h3>
            <div className="sort-controls">
              <select>
                <option>{translations.sortBy}</option>
                <option>{translations.priceAsc}</option>
                <option>{translations.priceDesc}</option>
                <option>{translations.newest}</option>
                <option>{translations.featured}</option>
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
          
          <div className="gear-grid">
            {filteredGear.map(item => (
              <div key={item.id} className="gear-card">
                <div className="gear-image">
                  <img src={item.image} alt={item.name} />
                  <div className="gear-badges">
                    <span className={`condition-badge ${item.condition}`}>
                      {translations[item.condition]}
                    </span>
                    {item.verifiedSeller && (
                      <span className="verified-badge">
                        ✓ {translations.verified}
                      </span>
                    )}
                  </div>
                </div>
                <div className="gear-details">
                  <h4 className="gear-name">{item.name}</h4>
                  <p className="gear-brand">{translations.brand}: {item.brand}</p>
                  <p className="gear-size">{translations.size}: {item.size}</p>
                  <p className="gear-price">Rs. {item.price.toLocaleString()}</p>
                  <p className="gear-location">📍 {item.location}</p>
                  <div className="gear-rating">
                    <span className="stars">{'⭐'.repeat(item.rating)}</span>
                    <span className="rating-text">({item.rating}/5)</span>
                  </div>
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

export default BikerGear;
