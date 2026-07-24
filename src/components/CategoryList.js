import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, Search, SlidersHorizontal, X, Loader2, Bike } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { getVehicles } from '../api/bikeApi';
import './CategoryList.css';

const LABELS = {
  all: 'All Bikes',
  scooters: 'Scooters',
  trail: 'Trail',
  sport: 'Sport',
  cruiser: 'Classic / Cruiser',
  electric: 'Electric',
  'high-capacity': 'High Capacity',
  'atv-adv': 'ATV / ADV',
};

// Sri Lanka districts (same order as AddVehicleForm)
const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

// Common bike brands (same as AddVehicleForm)
const COMMON_BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'KTM', 'Kawasaki',
  'BMW', 'Ducati', 'Triumph', 'Vespa', 'Aprilia', 'Royal Enfield',
  'Harley-Davidson', 'Demak', 'Daelim', 'Loncin', 'Lifan',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'mileage-asc', label: 'Mileage: Low to High' },
];

const PRICE_PRESET_OPTIONS = [
  { value: 'custom', label: 'Custom Price Range' },
  { value: '', label: 'Any Price Range' },
  { value: '0-100000', label: 'Under Rs. 100,000' },
  { value: '100000-300000', label: 'Rs. 100,000 - 300,000' },
  { value: '300000-500000', label: 'Rs. 300,000 - 500,000' },
  { value: '500000-1000000', label: 'Rs. 500,000 - 1,000,000' },
  { value: '1000000+', label: 'Above Rs. 1,000,000' },
];

// Custom Single-Select Popover Dropdown (replacing native HTML select)
const CustomSelectDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  alignRight = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`filter-dropdown-wrap ${className}`} ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className="select filter-select"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer'
        }}
      >
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.88rem' }}>
          {displayLabel}
        </span>
        <ChevronDown className="filter-select-icon" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      </button>

      {isOpen && (
        <div
          className="custom-dropdown-popover animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            position: 'absolute',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            top: 'calc(100% + 4px)',
            zIndex: 9999,
            width: '100%',
            minWidth: '180px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {options.map(opt => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#0f172a' : '#334155',
                  background: isSelected ? '#ffd600' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Custom Searchable Dropdown Popover (replacing native HTML select)
const CustomSearchDropdown = ({
  options = [],
  selectedValues = [],
  onSelect,
  placeholder = "Select option",
  searchPlaceholder = "Search..."
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter(opt => opt.toLowerCase().includes(search.trim().toLowerCase()));
  }, [options, search]);

  return (
    <div className="filter-dropdown-wrap" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className="select filter-select"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer'
        }}
      >
        <span style={{ color: '#94a3b8', fontWeight: 400 }}>
          {placeholder}
        </span>
        <ChevronDown className="filter-select-icon" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      </button>

      {isOpen && (
        <div
          className="custom-dropdown-popover animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 4px)',
            zIndex: 9999,
            width: '100%',
            minWidth: '220px',
            maxHeight: '260px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {/* Search box inside dropdown */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                fontSize: '0.82rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                background: '#f8fafc'
              }}
              autoFocus
            />
          </div>

          {/* Options list */}
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      if (!isSelected) {
                        onSelect(opt);
                        setSearch('');
                        setIsOpen(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#94a3b8' : '#0f172a',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSelected ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = '#fef3c7';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <X style={{ width: '12px', height: '12px', color: '#94a3b8' }} />}
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Year-Only Calendar Popover (styled like calendar popover, strictly for year selection)
const YearPickerPopover = ({ value, onChange, placeholder = "Select Year", minAllowed = '', maxAllowed = '', alignRight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [decadeStart, setDecadeStart] = useState(Math.floor(currentYear / 10) * 10 - 10);
  
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const yearsInDecade = [];
  for (let y = decadeStart + 11; y >= decadeStart; y--) {
    if (y <= currentYear + 1 && y >= 1980) {
      yearsInDecade.push(y);
    }
  }

  const handlePrevPage = () => {
    if (decadeStart - 12 >= 1970) {
      setDecadeStart(prev => prev - 12);
    }
  };

  const handleNextPage = () => {
    if (decadeStart + 12 <= currentYear + 1) {
      setDecadeStart(prev => prev + 12);
    }
  };

  return (
    <div className="filter-dropdown-wrap" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="select filter-select filter-datepicker-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer'
        }}
      >
        <span style={{ color: value ? '#0f172a' : '#94a3b8', fontWeight: value ? 600 : 400 }}>
          {value || placeholder}
        </span>
        <Calendar className="filter-select-icon" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      </button>

      {isOpen && (
        <div
          className="calendar-popover-card animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            position: 'absolute',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            top: 'calc(100% + 4px)',
            zIndex: 9999,
            width: '210px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
            padding: '12px'
          }}
        >
          {/* Header with Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={decadeStart <= 1970}
              style={{
                padding: '5px 8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: decadeStart <= 1970 ? 'not-allowed' : 'pointer',
                opacity: decadeStart <= 1970 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              <ChevronLeft style={{ width: '14px', height: '14px', color: '#475569' }} />
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              Select Year
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={decadeStart + 12 > currentYear + 1}
              style={{
                padding: '5px 8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: decadeStart + 12 > currentYear + 1 ? 'not-allowed' : 'pointer',
                opacity: decadeStart + 12 > currentYear + 1 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              <ChevronRight style={{ width: '14px', height: '14px', color: '#475569' }} />
            </button>
          </div>

          {/* Grid of Year Buttons (No months, No days) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {yearsInDecade.map(y => {
              const isDisabled = (minAllowed !== '' && y < Number(minAllowed)) || (maxAllowed !== '' && y > Number(maxAllowed));
              const isSelected = String(y) === String(value);
              return (
                <button
                  key={y}
                  type="button"
                  disabled={isDisabled}
                  style={{
                    padding: '8px 4px',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #d97706' : '1px solid #f1f5f9',
                    background: isSelected ? '#ffd600' : '#f8fafc',
                    color: isSelected ? '#0f172a' : isDisabled ? '#cbd5e1' : '#334155',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.12s ease'
                  }}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(String(y));
                      setIsOpen(false);
                    }
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>

          {value && (
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                style={{
                  fontSize: '0.72rem',
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

const MAX_SLIDER_LIMIT = 15000000;

// Zero-lag Dual Range Slider — uses direct DOM manipulation during drag,
// NEVER calls React setState while dragging, so the parent never re-renders.
// Commits final values on pointer release only.
const SmoothPriceSlider = React.memo(({ min = 0, max = MAX_SLIDER_LIMIT, step = 50000, valueMin, valueMax, onChange }) => {
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const thumbMinRef = useRef(null);
  const thumbMaxRef = useRef(null);
  const labelMinRef = useRef(null);
  const labelMaxRef = useRef(null);

  // Mutable drag values — never trigger React re-renders
  const dragRef = useRef({ min: valueMin, max: valueMax, dragging: false });

  const toPercent = useCallback(val => Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100)), [min, max]);

  const formatLabel = useCallback(val => val >= max ? 'Rs 15M+' : `Rs ${val.toLocaleString('en-LK')}`, [max]);

  // Pure DOM update — zero React overhead
  const paintSlider = useCallback((curMin, curMax) => {
    const pMin = toPercent(curMin);
    const pMax = toPercent(curMax);
    if (thumbMinRef.current) thumbMinRef.current.style.left = pMin + '%';
    if (thumbMaxRef.current) thumbMaxRef.current.style.left = pMax + '%';
    if (fillRef.current) {
      fillRef.current.style.left = pMin + '%';
      fillRef.current.style.width = Math.max(0, pMax - pMin) + '%';
    }
    if (labelMinRef.current) labelMinRef.current.textContent = formatLabel(curMin);
    if (labelMaxRef.current) labelMaxRef.current.textContent = formatLabel(curMax);
  }, [toPercent, formatLabel]);

  // Sync ref when props change (e.g. from preset dropdown)
  useEffect(() => {
    if (!dragRef.current.dragging) {
      dragRef.current.min = valueMin;
      dragRef.current.max = valueMax;
      paintSlider(valueMin, valueMax);
    }
  }, [valueMin, valueMax, paintSlider]);

  const getValueFromX = clientX => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const rawPercent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawVal = min + rawPercent * (max - min);
    const stepped = Math.round(rawVal / step) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  const startDrag = (thumbType, startEvent) => {
    startEvent.preventDefault();
    startEvent.stopPropagation();
    dragRef.current.dragging = true;

    const onPointerMove = moveEvent => {
      const val = getValueFromX(moveEvent.clientX);
      if (thumbType === 'min') {
        dragRef.current.min = Math.min(val, dragRef.current.max - step);
      } else {
        dragRef.current.max = Math.max(val, dragRef.current.min + step);
      }
      paintSlider(dragRef.current.min, dragRef.current.max);
    };

    const onPointerUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      // Single React state commit on release
      onChange(dragRef.current.min, dragRef.current.max);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleTrackClick = e => {
    if (!trackRef.current) return;
    const clickVal = getValueFromX(e.clientX);
    const distMin = Math.abs(clickVal - dragRef.current.min);
    const distMax = Math.abs(clickVal - dragRef.current.max);

    if (distMin < distMax) {
      dragRef.current.min = Math.min(clickVal, dragRef.current.max - step);
    } else {
      dragRef.current.max = Math.max(clickVal, dragRef.current.min + step);
    }
    paintSlider(dragRef.current.min, dragRef.current.max);
    onChange(dragRef.current.min, dragRef.current.max);
  };

  const minPct = toPercent(valueMin);
  const maxPct = toPercent(valueMax);

  return (
    <div className="custom-slider-container">
      <div className="custom-slider-track" ref={trackRef} onClick={handleTrackClick}>
        <div
          ref={fillRef}
          className="custom-slider-fill"
          style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
        />
        <div
          ref={thumbMinRef}
          className="custom-slider-thumb thumb-min"
          style={{ left: `${minPct}%` }}
          onPointerDown={e => startDrag('min', e)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={valueMax}
          aria-valuenow={valueMin}
          tabIndex={0}
        />
        <div
          ref={thumbMaxRef}
          className="custom-slider-thumb thumb-max"
          style={{ left: `${maxPct}%` }}
          onPointerDown={e => startDrag('max', e)}
          role="slider"
          aria-valuemin={valueMin}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          tabIndex={0}
        />
      </div>
      <div className="custom-slider-labels">
        <span ref={labelMinRef}>Rs {valueMin.toLocaleString('en-LK')}</span>
        <span ref={labelMaxRef}>{valueMax >= max ? 'Rs 15M+' : `Rs ${valueMax.toLocaleString('en-LK')}`}</span>
      </div>
    </div>
  );
});

const CategoryList = ({ allVehicles = [] }) => {
  const { type = 'all' } = useParams();
  const routeLocation = useLocation();
  const label = LABELS[type] || 'Bikes';

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [vehiclesFromApi, setVehiclesFromApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);

  // Real-time client-side price range state (0ms latency, zero API calls on slider movement)
  const [localMin, setLocalMin] = useState(0);
  const [localMax, setLocalMax] = useState(MAX_SLIDER_LIMIT);

  // Synchronize local slider values when priceMin / priceMax change externally (e.g., presets)
  useEffect(() => {
    setLocalMin(priceMin !== '' ? Math.max(0, Math.min(Number(priceMin), MAX_SLIDER_LIMIT)) : 0);
  }, [priceMin]);

  useEffect(() => {
    setLocalMax(priceMax !== '' ? Math.max(0, Math.min(Number(priceMax), MAX_SLIDER_LIMIT)) : MAX_SLIDER_LIMIT);
  }, [priceMax]);

  // Read URL search parameters on mount or navigation change
  useEffect(() => {
    const searchParams = new URLSearchParams(routeLocation.search);
    const brand = searchParams.get('brand') || searchParams.get('make');
    const loc = searchParams.get('location');
    const priceR = searchParams.get('priceRange');
    const mod = searchParams.get('model');
    const kw = searchParams.get('keywords') || searchParams.get('search');
    const pMin = searchParams.get('priceMin');
    const pMax = searchParams.get('priceMax');
    const sort = searchParams.get('sortBy');

    if (brand) setSelectedMakes([brand]);
    if (loc) setSelectedLocations([loc]);
    if (mod || kw) setKeywords(mod || kw || '');
    if (sort) setSortBy(sort);

    if (priceR) {
      if (priceR.includes('-')) {
        const [minVal, maxVal] = priceR.split('-');
        setPriceMin(minVal || '');
        setPriceMax(maxVal || '');
      } else if (priceR.endsWith('+')) {
        setPriceMin(priceR.replace('+', '') || '');
        setPriceMax('');
      }
    } else {
      if (pMin !== null && pMin !== undefined) setPriceMin(pMin);
      if (pMax !== null && pMax !== undefined) setPriceMax(pMax);
    }
  }, [routeLocation.search]);

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

  // Fetch vehicles from backend (Price filtering is handled client-side in real-time without API calls)
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        type: type !== 'all' ? type : undefined,
        locations: selectedLocations.length ? selectedLocations.join(',') : undefined,
        makes: selectedMakes.length ? selectedMakes.join(',') : undefined,
        yearMin: yearMin !== '' ? yearMin : undefined,
        yearMax: yearMax !== '' ? yearMax : undefined,
        keywords: keywords.trim() ? keywords.trim() : undefined,
        sortBy,
      };
      const res = await getVehicles(params);
      setVehiclesFromApi(Array.isArray(res) ? res : []);
      setApiFetched(true);
    } catch (error) {
      console.error('Error fetching filtered vehicles from backend:', error);
      setVehiclesFromApi([]);
    } finally {
      setLoading(false);
    }
  }, [type, selectedLocations, selectedMakes, yearMin, yearMax, keywords, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  // REAL-TIME payload filtering on client side (0ms response, NO API CALL when price slider moves)
  const displayVehicles = useMemo(() => {
    const rawList = apiFetched ? vehiclesFromApi : allVehicles;
    let list = Array.isArray(rawList) ? [...rawList] : [];

    const minP = localMin > 0 ? localMin : (priceMin !== '' ? Number(priceMin) : null);
    const maxP = localMax < MAX_SLIDER_LIMIT ? localMax : (priceMax !== '' ? Number(priceMax) : null);

    if (minP !== null && !isNaN(minP)) {
      list = list.filter(v => v.price == null || Number(v.price) >= minP);
    }
    if (maxP !== null && !isNaN(maxP)) {
      list = list.filter(v => v.price == null || Number(v.price) <= maxP);
    }

    return list;
  }, [apiFetched, vehiclesFromApi, allVehicles, localMin, localMax, priceMin, priceMax]);


  const resetFilters = () => {
    setSelectedLocations([]);
    setSelectedMakes([]);
    setPriceMin('');
    setPriceMax('');
    setLocalMin(0);
    setLocalMax(MAX_SLIDER_LIMIT);
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
        setLocalMin(0);
        setLocalMax(MAX_SLIDER_LIMIT);
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
    ...(priceMin || priceMax || localMin > 0 || localMax < MAX_SLIDER_LIMIT
      ? [{ key: 'price', type: 'price', group: 'Price', label: formatRange(localMin > 0 ? localMin : priceMin, localMax < MAX_SLIDER_LIMIT ? localMax : priceMax, 'Rs ') }]
      : []),
    ...(yearMin || yearMax
      ? [{ key: 'year', type: 'year', group: 'Year', label: formatRange(yearMin, yearMax) }]
      : []),
    ...(keywords.trim()
      ? [{ key: 'keyword', type: 'keyword', group: 'Search', label: keywords.trim() }]
      : []),
  ];

  const count = displayVehicles.length;
  const activeFilterCount = activeFilters.length;

  const sortControl = (
    <div className="sort-controls">
      <label htmlFor="category-sort" className="sort-label">Sort</label>
      <CustomSelectDropdown
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={val => setSortBy(val)}
        alignRight={true}
      />
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
          <h4 className="sidebar-title">Location (District)</h4>
          {selectedLocations.length > 0 && <span>{selectedLocations.length}</span>}
        </div>
        <CustomSearchDropdown
          options={SRI_LANKA_DISTRICTS}
          selectedValues={selectedLocations}
          onSelect={val => setSelectedLocations(prev => [...prev, val])}
          placeholder="Select district"
          searchPlaceholder="Search district..."
        />
        {selectedLocations.length > 0 && (
          <div className="selected-tags">
            {selectedLocations.map(loc => (
              <button key={loc} type="button" className="selected-tag" onClick={() => setSelectedLocations(prev => prev.filter(l => l !== loc))}>
                {loc} <X className="tag-x" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Manufacturer</h4>
          {selectedMakes.length > 0 && <span>{selectedMakes.length}</span>}
        </div>
        <CustomSearchDropdown
          options={COMMON_BRANDS}
          selectedValues={selectedMakes}
          onSelect={val => setSelectedMakes(prev => [...prev, val])}
          placeholder="Select brand"
          searchPlaceholder="Search brand..."
        />
        {selectedMakes.length > 0 && (
          <div className="selected-tags">
            {selectedMakes.map(mk => (
              <button key={mk} type="button" className="selected-tag" onClick={() => setSelectedMakes(prev => prev.filter(m => m !== mk))}>
                {mk} <X className="tag-x" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Year Manufactured</h4>
        </div>
        <div className="dual-input">
          <YearPickerPopover
            value={yearMin}
            onChange={setYearMin}
            placeholder="Min Year"
            maxAllowed={yearMax}
          />
          <YearPickerPopover
            value={yearMax}
            onChange={setYearMax}
            placeholder="Max Year"
            minAllowed={yearMin}
            alignRight={true}
          />
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <h4 className="sidebar-title">Price Rate Selection</h4>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <CustomSelectDropdown
            options={PRICE_PRESET_OPTIONS}
            value={
              localMin === 0 && localMax === 100000 ? '0-100000' :
              localMin === 100000 && localMax === 300000 ? '100000-300000' :
              localMin === 300000 && localMax === 500000 ? '300000-500000' :
              localMin === 500000 && localMax === 1000000 ? '500000-1000000' :
              localMin === 1000000 && localMax === MAX_SLIDER_LIMIT ? '1000000+' :
              'custom'
            }
            onChange={val => {
              if (val === '0-100000') { setLocalMin(0); setLocalMax(100000); setPriceMin(''); setPriceMax('100000'); }
              else if (val === '100000-300000') { setLocalMin(100000); setLocalMax(300000); setPriceMin('100000'); setPriceMax('300000'); }
              else if (val === '300000-500000') { setLocalMin(300000); setLocalMax(500000); setPriceMin('300000'); setPriceMax('500000'); }
              else if (val === '500000-1000000') { setLocalMin(500000); setLocalMax(1000000); setPriceMin('500000'); setPriceMax('1000000'); }
              else if (val === '1000000+') { setLocalMin(1000000); setLocalMax(MAX_SLIDER_LIMIT); setPriceMin('1000000'); setPriceMax(''); }
              else if (val === '') { setLocalMin(0); setLocalMax(MAX_SLIDER_LIMIT); setPriceMin(''); setPriceMax(''); }
            }}
          />
        </div>

        {/* Real-time zero-latency smooth dual price slider (NO API CALL) */}
        <SmoothPriceSlider
          min={0}
          max={MAX_SLIDER_LIMIT}
          step={50000}
          valueMin={localMin}
          valueMax={localMax}
          onChange={(newMin, newMax) => {
            setLocalMin(newMin);
            setLocalMax(newMax);
          }}
        />
      </div>

      <div className={isMobile ? 'drawer-actions' : 'filter-actions'}>
        <button className="btn btn-primary" onClick={() => { setMobileFiltersOpen(false); fetchVehicles(); }} type="button">
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
            </p>
          </div>
          <div
            className={`heading-stat${count === 0 ? ' heading-stat--empty' : ''}${loading ? ' heading-stat--loading' : ''}`}
            role="status"
            aria-live="polite"
            aria-busy={loading}
            aria-label={
              loading
                ? 'Loading results'
                : `${count} active ${count === 1 ? 'result' : 'results'}`
            }
          >
            <div className="heading-stat-icon" aria-hidden="true">
              <Bike />
              {!loading && count > 0 && <span className="heading-stat-live" />}
            </div>
            <div className="heading-stat-body">
              <div className="heading-stat-row">
                <span className="heading-stat-value">
                  {loading ? '—' : count.toLocaleString()}
                </span>
                {activeFilterCount > 0 && !loading && (
                  <span className="heading-stat-pill">
                    {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </span>
                )}
              </div>
              <span className="heading-stat-label">Active results</span>
              <span className="heading-stat-hint">
                {loading
                  ? 'Updating listings…'
                  : activeFilterCount > 0
                    ? 'Matching your current filters'
                    : 'All listings in this category'}
              </span>
            </div>
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
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
                <Loader2 className="animate-spin" style={{ width: '36px', height: '36px', color: '#ffd600' }} />
                <span style={{ color: '#64748b', fontWeight: 500 }}>Fetching listings from server...</span>
              </div>
            ) : (
              <div className="cards">
                {displayVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} horizontal />
                ))}
                {!displayVehicles.length && (
                  <div className="empty">
                    <h3>No {label.toLowerCase()} found</h3>
                    <p>Try removing a filter or searching a different model.</p>
                    <button className="btn btn-primary" type="button" onClick={resetFilters}>
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            )}
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
