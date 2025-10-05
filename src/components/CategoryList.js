import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { FiFilter, FiX } from 'react-icons/fi';

const LABELS = {
  scooters: 'Scooters',
  trail: 'Trail',
  sport: 'Sport',
  cruiser: 'Classic / Cruiser',
  electric: 'Electric',
  'high-capacity': 'High Capacity',
  'atv-adv': 'ATV / ADV',
};

const CategoryList = ({ allVehicles }) => {
  const { type } = useParams();
  const label = LABELS[type] || 'Bikes';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [type]);

  const vehiclesOfType = useMemo(() => {
    const getCc = v => {
      const raw =
        v.engineCapacityCc ?? // Added this field from AddVehicleForm
        v.engineCc ??
        v.displacementCc ??
        v.cc ??
        (v.engine && v.engine.cc) ??
        (v.specs && v.specs.engine && v.specs.engine.cc);
      if (raw == null) return null;
      const match = String(raw).match(/[\d.]+/);
      const num = match ? Number(match[0]) : null;
      return Number.isFinite(num) ? num : null;
    };

    const isAtvAdv = v => {
      const toStr = x => (x == null ? '' : String(x).toLowerCase());
      const arrToStr = a => (Array.isArray(a) ? a.map(toStr).join(' ') : '');
      const haystack = [
        toStr(v.type),
        toStr(v.subtype),
        toStr(v.category),
        toStr(v.bodyType),
        toStr(v.segment),
        toStr(v.title),
        toStr(v.name),
        toStr(v.model),
        toStr(v.modelName),
        arrToStr(v.categories),
        arrToStr(v.tags),
      ].join(' ');

      return /\batv\b|\bquad\b|four[-\s]?wheeler|\badv\b|\badventure\b|dual[-\s]?sport/.test(haystack);
    };

    if (type === 'high-capacity') {
      const THRESHOLD = 250;
      return allVehicles.filter(v => {
        const cc = getCc(v);
        return cc != null && cc >= THRESHOLD;
      });
    }

    if (type === 'atv-adv') {
      return allVehicles.filter(
        v =>
          v.type === 'atv-adv' ||
          v.type === 'atv' ||
          v.type === 'adv' ||
          v.type === 'adventure' ||
          v.type === 'dual-sport' ||
          isAtvAdv(v)
      );
    }

    return allVehicles.filter(v => v.type === type);
  }, [allVehicles, type]);

  const locations = useMemo(
    () =>
      Array.from(new Set(vehiclesOfType.map(v => v.location).filter(Boolean))).sort(),
    [vehiclesOfType]
  );
  const makes = useMemo(
    () =>
      Array.from(new Set(vehiclesOfType.map(v => v.make).filter(Boolean))).sort(),
    [vehiclesOfType]
  );

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [applyVersion, setApplyVersion] = useState(0);

  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    if (isMobileFiltersOpen) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      body.style.overflow = prevBodyOverflow || '';
      html.style.overflow = prevHtmlOverflow || '';
    }

    return () => {
      body.style.overflow = prevBodyOverflow || '';
      html.style.overflow = prevHtmlOverflow || '';
    };
  }, [isMobileFiltersOpen]);

  const handleCheck = (value, listSetter) => {
    listSetter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const resetFilters = () => {
    setSelectedLocations([]);
    setSelectedMakes([]);
    setPriceMin('');
    setPriceMax('');
    setYearMin('');
    setYearMax('');
    setKeywords('');
    setSortBy('newest');
    setApplyVersion(v => v + 1);
  };

  const applyFilters = () => {
    setApplyVersion(v => v + 1);
    setMobileFiltersOpen(false);
  };

  const filteredVehicles = useMemo(() => {
    let list = [...vehiclesOfType];
    void applyVersion;

    if (selectedLocations.length) {
      list = list.filter(v => selectedLocations.includes(v.location));
    }
    if (selectedMakes.length) {
      list = list.filter(v => selectedMakes.includes(v.make));
    }

    const minP = priceMin ? Number(priceMin) : null;
    const maxP = priceMax ? Number(priceMax) : null;
    if (minP != null) list = list.filter(v => v.price == null || v.price >= minP);
    if (maxP != null) list = list.filter(v => v.price == null || v.price <= maxP);

    const minY = yearMin ? Number(yearMin) : null;
    const maxY = yearMax ? Number(yearMax) : null;
    if (minY != null) list = list.filter(v => v.year >= minY);
    if (maxY != null) list = list.filter(v => v.year <= maxY);

    if (keywords.trim()) {
      const q = keywords.toLowerCase();
      list = list.filter(v => (v.title || '').toLowerCase().includes(q));
    }

    const priceOrInfinity = (p, dir = 'asc') => {
      if (p == null) return dir === 'asc' ? Infinity : -Infinity;
      return p;
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
    applyVersion
  ]);

  const count = filteredVehicles.length;

  const FilterForm = ({ isMobile = false }) => (
    <div className="sidebar-content">
      <div className="sidebar-section">
        <h4 className="sidebar-title">Location</h4>
        <input className="input" placeholder="Search location" onChange={() => {}} />
        <div className="checkbox-list">
          {locations.map(loc => (
            <label key={loc} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => handleCheck(loc, setSelectedLocations)}
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-title">Manufacturer</h4>
        <div className="checkbox-list">
          {makes.map(mk => (
            <label key={mk} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedMakes.includes(mk)}
                onChange={() => handleCheck(mk, setSelectedMakes)}
              />
              <span>{mk}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-title">Year Manufactured</h4>
        <div className="dual-input">
          <input className="input" type="number" placeholder="Min" value={yearMin} onChange={e => setYearMin(e.target.value)} />
          <input className="input" type="number" placeholder="Max" value={yearMax} onChange={e => setYearMax(e.target.value)} />
        </div>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-title">Price</h4>
        <div className="dual-input">
          <input className="input" type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
          <input className="input" type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
        </div>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-title">Keywords</h4>
        <input className="input" placeholder="e.g., Ninja, PCX" value={keywords} onChange={e => setKeywords(e.target.value)} />
      </div>

      <div className={isMobile ? 'drawer-actions' : ''}>
        <button className="btn btn-primary" onClick={applyFilters} type="button">Apply filters</button>
        <button className="btn btn-reset" type="button" onClick={resetFilters}>Reset</button>
      </div>

      {!isMobile && (
        <div className="sidebar-footer">
          <Link to="/" className="link">← Back to Quick Filters</Link>
        </div>
      )}
    </div>
  );

  return (
    <main className="category-page">
      <div className="container">
        <div className="list-topbar">
          <button className="btn btn-primary mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)} type="button">
            <FiFilter className="icon" aria-hidden="true" />
            <span className="btn-text">Filters</span>
          </button>
        </div>

        <div className="category-grid">
          <aside className="sidebar desktop-only">
            <FilterForm />
          </aside>

          <section className="list-area">
            <div className="list-header">
              <div className="list-count">
                <strong>{count}</strong> {label} for sale in Sri Lanka
              </div>
              <div className="sort-controls desktop-only">
                <label htmlFor="sortBy2" className="sort-label">Sort by</label>
                <select
                  id="sortBy2"
                  className="select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="mileage-asc">Mileage: Low to High</option>
                </select>
              </div>
            </div>

            <div className="cards">
              {filteredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              {!filteredVehicles.length && <div className="empty">No results. Adjust filters and try again.</div>}
            </div>
          </section>
        </div>
      </div>

      <div className={`mobile-filters-drawer ${isMobileFiltersOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Filters">
        <div className="drawer-header">
          <strong>Filters</strong>
          <button className="icon-btn" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} type="button">
            <FiX />
          </button>
        </div>
        <div className="drawer-body">
          <FilterForm isMobile />
          <div className="drawer-footer">
            <button className="btn btn-primary" onClick={applyFilters} type="button">Apply filters</button>
          </div>
        </div>
      </div>
      <div className={`backdrop ${isMobileFiltersOpen ? 'open' : ''}`} onClick={() => setMobileFiltersOpen(false)} />
    </main>
  );
};

export default CategoryList;