import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { getVehicles } from '../api/bikeApi';
import VehicleCard from './VehicleCard';
import {
  filtersToApiParams,
  filtersToQueryString,
  formatFilterSummary,
  hasActiveSearchFilters,
} from '../utils/vehicleSearchParams';
import './GlobalSearchResults.css';

const GlobalSearchResults = ({ searchFilters, onClearSearch }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const active = hasActiveSearchFilters(searchFilters);
  const apiParams = useMemo(() => filtersToApiParams(searchFilters), [searchFilters]);
  const summary = useMemo(() => formatFilterSummary(searchFilters), [searchFilters]);
  const browseQuery = filtersToQueryString(searchFilters);

  useEffect(() => {
    if (!active) {
      setVehicles([]);
      setError('');
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const list = await getVehicles(apiParams);
        if (!cancelled) {
          setVehicles(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError('Could not load listings. Check that the backend is running.');
          setVehicles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, apiParams]);

  if (!active) return null;

  const count = vehicles.length;

  return (
    <section
      id="global-search-results"
      className="global-search-results"
      aria-live="polite"
      aria-label="Search results"
    >
      <div className="container">
        <div className="global-search-results__shell">
          <header className="global-search-results__header">
            <div>
              <span className="global-search-results__eyebrow">
                <Search aria-hidden="true" size={14} />
                Search results
              </span>
              <h2>Bikes matching your search</h2>
              {summary.length > 0 && (
                <ul className="global-search-results__criteria">
                  {summary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="global-search-results__actions">
              <Link
                to={`/browse/all${browseQuery ? `?${browseQuery}` : ''}`}
                className="global-search-results__link"
              >
                Open advanced browse
              </Link>
              {onClearSearch && (
                <button type="button" className="global-search-results__clear" onClick={onClearSearch}>
                  <X aria-hidden="true" size={16} />
                  Clear search
                </button>
              )}
            </div>
          </header>

          {loading && (
            <div className="global-search-results__state">
              <Loader2 className="global-search-results__spin" aria-hidden="true" />
              <p>Searching listings…</p>
            </div>
          )}

          {!loading && error && (
            <div className="global-search-results__state global-search-results__state--error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="global-search-results__count">
                <strong>{count.toLocaleString()}</strong>{' '}
                {count === 1 ? 'listing' : 'listings'} found
              </p>
              {count > 0 ? (
                <div className="global-search-results__grid">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="global-search-results__empty">
                  <h3>No bikes match these filters</h3>
                  <p>Try a different brand, model, price range, or location.</p>
                  {onClearSearch && (
                    <button type="button" className="global-search-results__retry" onClick={onClearSearch}>
                      Reset search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GlobalSearchResults;
