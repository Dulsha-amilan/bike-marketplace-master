// components/SearchBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ searchFilters, setSearchFilters, translations }) => {
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.brand) params.set('brand', searchFilters.brand);
    if (searchFilters.model) params.set('model', searchFilters.model);
    if (searchFilters.priceRange) params.set('priceRange', searchFilters.priceRange);
    if (searchFilters.location) params.set('location', searchFilters.location);

    const queryString = params.toString();
    navigate(`/browse/all${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="search-bar">
      <div className="search-grid">
        <div className="search-field">
          <label>{translations.brand}</label>
          <select 
            value={searchFilters.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
          >
            <option value="">All Brands</option>
            <option value="honda">Honda</option>
            <option value="yamaha">Yamaha</option>
            <option value="bajaj">Bajaj</option>
            <option value="tvs">TVS</option>
            <option value="hero">Hero</option>
          </select>
        </div>
        
        <div className="search-field">
          <label>{translations.model}</label>
          <input 
            type="text"
            placeholder="Enter model"
            value={searchFilters.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
          />
        </div>
        
        <div className="search-field">
          <label>{translations.price}</label>
          <select 
            value={searchFilters.priceRange}
            onChange={(e) => handleInputChange('priceRange', e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="0-100000">Under Rs. 100,000</option>
            <option value="100000-300000">Rs. 100,000 - 300,000</option>
            <option value="300000-500000">Rs. 300,000 - 500,000</option>
            <option value="500000+">Above Rs. 500,000</option>
          </select>
        </div>
        
        <div className="search-field">
          <label>{translations.location}</label>
          <select 
            value={searchFilters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="colombo">Colombo</option>
            <option value="kandy">Kandy</option>
            <option value="galle">Galle</option>
            <option value="jaffna">Jaffna</option>
            <option value="negombo">Negombo</option>
          </select>
        </div>
        
        <button className="search-button" onClick={handleSearch}>
           {translations.search}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
