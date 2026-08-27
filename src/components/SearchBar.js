// components/SearchBar.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import './SearchBar.css';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const BRANDS_LIST = [
  'Honda', 'Yamaha', 'Bajaj', 'TVS', 'Hero', 'Suzuki', 'KTM', 'Kawasaki',
  'Royal Enfield', 'BMW', 'Ducati', 'Triumph', 'Vespa', 'Aprilia',
  'Harley-Davidson', 'Demak', 'Daelim', 'Loncin', 'Lifan'
];

const MODELS_LIST = [
  'CB Shine', 'Pulsar 150', 'FZ-S', 'Apache RTR 160', 'Dio', 'Activa 6G',
  'Raider 125', 'KTM Duke 200', 'CT 100', 'PCX 160', 'Wave 110', 'MT-15',
  'Ray ZR 125', 'Scoopy', 'Vespa VXL 150', 'NMAX 155', 'Xpulse 200',
  'Dominar 400', 'Classic 350', 'H\'ness CB350', 'R15 V4', 'Platina 100',
  'Discover 125', 'NTORQ 125'
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '0-100000', label: 'Under Rs. 100,000' },
  { value: '100000-300000', label: 'Rs. 100,000 - 300,000' },
  { value: '300000-500000', label: 'Rs. 300,000 - 500,000' },
  { value: '500000-1000000', label: 'Rs. 500,000 - 1,000,000' },
  { value: '1000000+', label: 'Above Rs. 1,000,000' }
];

// Custom Searchable Dropdown Popover matching Image 1
const CustomSearchDropdown = ({
  id,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select',
  searchPlaceholder = 'Search...',
  allowCustomInput = false,
  allLabel = 'All',
  dropUp = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const query = search.trim().toLowerCase();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
    );
  }, [normalizedOptions, search]);

  const selectedOpt = normalizedOptions.find(
    opt => String(opt.value).toLowerCase() === String(value).toLowerCase()
  );

  const displayLabel = value
    ? (selectedOpt ? selectedOpt.label : value)
    : placeholder;

  return (
    <div className={`searchable-dropdown-wrap ${isOpen ? 'is-open-wrap' : ''}`} ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`searchable-dropdown-btn ${isOpen ? 'is-open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="searchable-dropdown-label">{displayLabel}</span>
        <ChevronDown className={`searchable-dropdown-chevron ${isOpen ? 'rotate' : ''}`} size={16} />
      </button>

      {isOpen && (
        <div className={`searchable-dropdown-popover animate-in fade-in slide-in-from-top-2 duration-150 ${dropUp ? 'drop-up' : ''}`}>
          {/* Search box inside dropdown */}
          <div className="searchable-dropdown-search-box">
            <Search className="search-box-icon" size={15} />
            <input
              type="text"
              className="search-box-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (allowCustomInput) {
                  onChange(e.target.value);
                }
              }}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="search-box-clear"
                onClick={() => {
                  setSearch('');
                  if (allowCustomInput) onChange('');
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options container with custom scrollbar & scroll arrows */}
          <div className="searchable-dropdown-options-container">
            <div className="scroll-arrow scroll-arrow-up" title="Scroll Up">▲</div>
            <div className="searchable-dropdown-list">
              {/* Reset / All option */}
              {allLabel && (
                <button
                  type="button"
                  className={`searchable-option-item ${!value ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange('');
                    setSearch('');
                    setIsOpen(false);
                  }}
                >
                  <span>{allLabel}</span>
                </button>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(value).toLowerCase() === String(opt.value).toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`searchable-option-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        onChange(opt.value);
                        setSearch('');
                        setIsOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="no-search-results">
                  {allowCustomInput ? `Press Search to search for "${search}"` : 'No matching results'}
                </div>
              )}
            </div>
            <div className="scroll-arrow scroll-arrow-down" title="Scroll Down">▼</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SearchBar = ({ searchFilters = {}, setSearchFilters, translations = {}, onSearch, dropUp = false }) => {
  const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(searchFilters);
    }
  };

  const brandOptions = useMemo(() => BRANDS_LIST.map(b => ({ value: b, label: b })), []);
  const modelOptions = useMemo(() => MODELS_LIST.map(m => ({ value: m, label: m })), []);
  const locationOptions = useMemo(() => SRI_LANKA_DISTRICTS.map(d => ({ value: d, label: d })), []);

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <div className="search-grid">
        <div className="search-field">
          <label htmlFor="hero-search-brand">{translations.brand || 'Brand'}</label>
          <CustomSearchDropdown
            id="hero-search-brand"
            value={searchFilters.brand || ''}
            onChange={(val) => handleInputChange('brand', val)}
            options={brandOptions}
            placeholder={translations.allBrands || 'All Brands'}
            searchPlaceholder="Search brand..."
            allLabel={translations.allBrands || 'All Brands'}
            dropUp={dropUp}
          />
        </div>

        <div className="search-field">
          <label htmlFor="hero-search-model">{translations.model || 'Model'}</label>
          <CustomSearchDropdown
            id="hero-search-model"
            value={searchFilters.model || ''}
            onChange={(val) => handleInputChange('model', val)}
            options={modelOptions}
            placeholder="Enter model"
            searchPlaceholder="Search model..."
            allowCustomInput={true}
            allLabel="All Models"
            dropUp={dropUp}
          />
        </div>

        <div className="search-field">
          <label htmlFor="hero-search-price">{translations.price || 'Price'}</label>
          <CustomSearchDropdown
            id="hero-search-price"
            value={searchFilters.priceRange || ''}
            onChange={(val) => handleInputChange('priceRange', val)}
            options={PRICE_OPTIONS}
            placeholder="Any Price"
            searchPlaceholder="Search price range..."
            allLabel="Any Price"
            dropUp={dropUp}
          />
        </div>

        <div className="search-field">
          <label htmlFor="hero-search-location">{translations.location || 'Location'}</label>
          <CustomSearchDropdown
            id="hero-search-location"
            value={searchFilters.location || ''}
            onChange={(val) => handleInputChange('location', val)}
            options={locationOptions}
            placeholder="All Locations"
            searchPlaceholder="Search district..."
            allLabel="All Locations"
            dropUp={dropUp}
          />
        </div>

        <button className="search-button" type="submit">
          {translations.search || 'Search'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

