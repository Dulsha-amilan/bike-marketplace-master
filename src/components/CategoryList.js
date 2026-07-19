import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import './CategoryList.css';

const LABELS = {
  scooters: 'Scooters',
  trail: 'Trail',
  sport: 'Sport',
  cruiser: 'Classic / Cruiser',
  electric: 'Electric',
  'high-capacity': 'High Capacity',
  'atv-adv': 'ATV / ADV',
};

const formatNumber = value => {
  if (value === '') return '';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString('en-LK') : value;
};

const formatRange = (min, max, prefix = '') => {
  if (min && max) return `${prefix}${formatNumber(min)} - ${prefix}${formatNumber(max)}`;
  if (min) return `${prefix}${formatNumber(min)}+`;
  if (max) return `Up to ${prefix}${formatNumber(max)}`;
  return '';
};

const filterOptions = (items, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(item => item.toLowerCase().includes(normalized));
};

const CategoryList = ({ allVehicles }) => {
  const { type } = useParams();
  const label = LABELS[type] || 'Bikes';
  const vehicles = useMemo(
    () => (Array.isArray(allVehicles) ? allVehicles : []),
    [allVehicles]
  );

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [makeSearch, setMakeSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [type]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    if (isMobileFiltersOpen) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }

    return () => {
      body.style.overflow = prevBodyOverflow || '';
      html.style.overflow = prevHtmlOverflow || '';
    };
  }, [isMobileFiltersOpen]);

  const vehiclesOfType = useMemo(() => {
    const isAtvAdv = vehicle => {
      const toStr = value => (value == null ? '' : String(value).toLowerCase());
      const arrToStr = value => (Array.isArray(value) ? value.map(toStr).join(' ') : '');
      const haystack = [
        toStr(vehicle.type),
        toStr(vehicle.subtype),
        toStr(vehicle.category),
        toStr(vehicle.bodyType),
        toStr(vehicle.segment),
        toStr(vehicle.title),
        toStr(vehicle.name),
        toStr(vehicle.model),
        toStr(vehicle.modelName),
        arrToStr(vehicle.categories),
        arrToStr(vehicle.tags),
      ].join(' ');

      return /\batv\b|\bquad\b|four[-\s]?wheeler|\badv\b|\badventure\b|dual[-\s]?sport/.test(haystack);
    };

    if (type === 'atv-adv') {
      return vehicles.filter(
        vehicle =>
          vehicle.type === 'atv-adv' ||
          vehicle.type === 'atv' ||
          vehicle.type === 'adv' ||
          vehicle.type === 'adventure' ||
          vehicle.type === 'dual-sport' ||
          isAtvAdv(vehicle)
      );
    }

    return vehicles.filter(vehicle => vehicle.type === type);
  }, [vehicles, type]);

  const locations = useMemo(
    () => Array.from(new Set(vehiclesOfType.map(vehicle => vehicle.location).filter(Boolean))).sort(),
    [vehiclesOfType]
  );

  const makes = useMemo(
    () => Array.from(new Set(vehiclesOfType.map(vehicle => vehicle.make).filter(Boolean))).sort(),
    [vehiclesOfType]
  );

  const filteredLocations = useMemo(
    () => filterOptions(locations, locationSearch),
    [locations, locationSearch]
  );

  const filteredMakes = useMemo(
    () => filterOptions(makes, makeSearch),
    [makes, makeSearch]
  );

  const handleCheck = (value, listSetter) => {
    listSetter(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const resetFilters = () => {
    setSelectedLocations([]);
    setSelectedMakes([]);
    setLocationSearch('');
    setMakeSearch('');
    setPriceMin('');
    setPriceMax('');
    setYearMin('');
    setYearMax('');
    setKeywords('');
    setSortBy('newest');
  };

  const clearFilter = filter => {
    switch (filter.type) {
      case 'location':
        setSelectedLocations(prev => prev.filter(item => item !== filter.value));
        break;
      case 'make':
        setSelectedMakes(prev => prev.filter(item => item !== filter.value));
        break;
      case 'price':
        setPriceMin('');
        setPriceMax('');
        break;
      case 'year':
        setYearMin('');
        setYearMax('');
        break;
      case 'keyword':
        setKeywords('');
        break;
      default:
        break;
    }
  };

  const filteredVehicles = useMemo(() => {
    let list = [...vehiclesOfType];

    if (selectedLocations.length) {
      list = list.filter(vehicle => selectedLocations.includes(vehicle.location));
    }

    if (selectedMakes.length) {
      list = list.filter(vehicle => selectedMakes.includes(vehicle.make));
    }

    const minP = priceMin !== '' ? Number(priceMin) : null;
    const maxP = priceMax !== '' ? Number(priceMax) : null;
    if (Number.isFinite(minP)) list = list.filter(vehicle => vehicle.price == null || vehicle.price >= minP);
    if (Number.isFinite(maxP)) list = list.filter(vehicle => vehicle.price == null || vehicle.price <= maxP);

    const minY = yearMin !== '' ? Number(yearMin) : null;
    const maxY = yearMax !== '' ? Number(yearMax) : null;
    if (Number.isFinite(minY)) list = list.filter(vehicle => vehicle.year >= minY);
    if (Number.isFinite(maxY)) list = list.filter(vehicle => vehicle.year <= maxY);

    if (keywords.trim()) {
      const query = keywords.toLowerCase();
      list = list.filter(vehicle =>
        [vehicle.title, vehicle.make, vehicle.model, vehicle.location]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(query))
      );
    }

    const priceOrInfinity = (price, dir = 'asc') => {
      if (price == null) return dir === 'asc' ? Infinity : -Infinity;
      return price;
    };

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return priceOrInfinity(a.price, 'asc') - priceOrInfinity(b.price, 'asc');
        case 'price-desc':
          return priceOrInfinity(b.price, 'desc') - priceOrInfinity(a.price, 'desc');
        case 'mileage-asc':
          return (a.mileageKm || Infinity) - (b.mileageKm || Infinity);
        case 'newest':
        default:
          return new Date(b.postedAt) - new Date(a.postedAt);
      }
    });

    return list;
  }, [
    vehiclesOfType,
    selectedLocations,
    selectedMakes,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    keywords,
    sortBy,
  ]);

  const activeFilters = [
    ...selectedLocations.map(value => ({
      key: `location-${value}`,
      type: 'location',
      group: 'Location',
      value,
      label: value,
    })),
    ...selectedMakes.map(value => ({
      key: `make-${value}`,
      type: 'make',
      group: 'Make',
      value,
      label: value,
    })),
    ...(priceMin || priceMax
      ? [{ key: 'price', type: 'price', group: 'Price', label: formatRange(priceMin, priceMax, 'Rs ') }]
      : []),
    ...(yearMin || yearMax
      ? [{ key: 'year', type: 'year', group: 'Year', label: formatRange(yearMin, yearMax) }]
      : []),
    ...(keywords.trim()
      ? [{ key: 'keyword', type: 'keyword', group: 'Search', label: keywords.trim() }]
      : []),
  ];

  const count = filteredVehicles.length;
  const activeFilterCount = activeFilters.length;

  const sortControl = (
    <div className="sort-controls">
      <label htmlFor="category-sort" className="sort-label">Sort</label>
      <select
        id="category-sort"
        className="select"
        value={sortBy}
        onChange={event => setSortBy(event.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="mileage-asc">Mileage: Low to High</option>
      </select>
    </div>
  );

  const FilterForm = ({ isMobile = false }) => (
    <div className="sidebar-content">
      <div className="filter-panel-header">
        <div>
          <span className="eyebrow">Refine</span>
          <h2>Filters</h2>
        </div>
        {activeFilterCount > 0 && (
          <button className="text-action" type="button" onClick={resetFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Location</h4>
          <span>{selectedLocations.length || locations.length}</span>
        </div>
        <label className="input-with-icon">
          <Search aria-hidden="true" />
          <input
            className="input"
            placeholder="Search location"
            value={locationSearch}
            onChange={event => setLocationSearch(event.target.value)}
          />
        </label>
        <div className="checkbox-list">
          {filteredLocations.length ? (
            filteredLocations.map(location => (
              <label key={location} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location)}
                  onChange={() => handleCheck(location, setSelectedLocations)}
                />
                <span>{location}</span>
              </label>
            ))
          ) : (
            <div className="option-empty">No locations found</div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Manufacturer</h4>
          <span>{selectedMakes.length || makes.length}</span>
        </div>
        <label className="input-with-icon">
          <Search aria-hidden="true" />
          <input
            className="input"
            placeholder="Search manufacturer"
            value={makeSearch}
            onChange={event => setMakeSearch(event.target.value)}
          />
        </label>
        <div className="checkbox-list">
          {filteredMakes.length ? (
            filteredMakes.map(make => (
              <label key={make} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedMakes.includes(make)}
                  onChange={() => handleCheck(make, setSelectedMakes)}
                />
                <span>{make}</span>
              </label>
            ))
          ) : (
            <div className="option-empty">No manufacturers found</div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Year Manufactured</h4>
        </div>
        <div className="dual-input">
          <input className="input" type="number" inputMode="numeric" placeholder="Min" value={yearMin} onChange={event => setYearMin(event.target.value)} />
          <input className="input" type="number" inputMode="numeric" placeholder="Max" value={yearMax} onChange={event => setYearMax(event.target.value)} />
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Price</h4>
        </div>
        <div className="dual-input">
          <input className="input" type="number" inputMode="numeric" placeholder="Min" value={priceMin} onChange={event => setPriceMin(event.target.value)} />
          <input className="input" type="number" inputMode="numeric" placeholder="Max" value={priceMax} onChange={event => setPriceMax(event.target.value)} />
        </div>
      </div>

      <div className={isMobile ? 'drawer-actions' : 'filter-actions'}>
        <button className="btn btn-primary" onClick={() => setMobileFiltersOpen(false)} type="button">
          Apply filters
        </button>
        <button className="btn btn-reset" type="button" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {!isMobile && (
        <div className="sidebar-footer">
          <Link to="/" className="back-link">
            <ChevronLeft aria-hidden="true" />
            Quick Filters
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <main className="category-page">
      <div className="container">
        <section className="results-heading">
          <div>
            <Link to="/" className="back-link heading-back">
              <ChevronLeft aria-hidden="true" />
              Quick Filters
            </Link>
            <h1>{label} for sale in Sri Lanka</h1>
            <p>
              <strong>{count}</strong> matching {count === 1 ? 'listing' : 'listings'}
              {vehiclesOfType.length !== count ? ` from ${vehiclesOfType.length} total` : ''}
            </p>
          </div>
          <div className="heading-stat">
            <span>{vehiclesOfType.length}</span>
            <small>Total listings</small>
          </div>
        </section>

        <div className="results-toolbar">
          <button
            className="btn btn-primary mobile-filter-btn"
            onClick={() => setMobileFiltersOpen(true)}
            type="button"
          >
            <SlidersHorizontal className="icon" aria-hidden="true" />
            <span className="btn-text">Filters</span>
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>

          <label className="toolbar-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder={`Search ${label.toLowerCase()}`}
              value={keywords}
              onChange={event => setKeywords(event.target.value)}
            />
          </label>

          {sortControl}
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filter-row" aria-label="Applied filters">
            <span className="active-label">Applied</span>
            {activeFilters.map(filter => (
              <button
                key={filter.key}
                className="filter-chip"
                type="button"
                onClick={() => clearFilter(filter)}
                aria-label={`Remove ${filter.group} filter ${filter.label}`}
              >
                <span>{filter.group}: {filter.label}</span>
                <X aria-hidden="true" />
              </button>
            ))}
            <button className="clear-chip" type="button" onClick={resetFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className="category-grid">
          <aside className="sidebar desktop-only">
            <FilterForm />
          </aside>

          <section className="list-area" aria-live="polite">
            <div className="cards">
              {filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} horizontal />
              ))}
              {!filteredVehicles.length && (
                <div className="empty">
                  <h3>No {label.toLowerCase()} found</h3>
                  <p>Try removing a filter or searching a different model.</p>
                  <button className="btn btn-primary" type="button" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div
        className={`mobile-filters-drawer ${isMobileFiltersOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Refine</span>
            <strong>Filters</strong>
          </div>
          <button
            className="icon-btn"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="drawer-body">
          <FilterForm isMobile />
        </div>
      </div>
      <div
        className={`backdrop ${isMobileFiltersOpen ? 'open' : ''}`}
        onClick={() => setMobileFiltersOpen(false)}
      />
    </main>
  );
};

export default CategoryList;
