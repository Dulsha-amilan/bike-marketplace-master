// components/FeaturedListings.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Gauge, MapPin, Home, Bike } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { useVehicles } from './vehiclesStore';
import './FeaturedListings.css';
import verifiedIcon from '../Images/verififedbutton.png';

const formatPrice = price => {
  if (price == null) return 'Negotiable';
  return `Rs: ${price.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
};

const formatDate = date => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toISOString().slice(0, 10);
};

const FeaturedListings = ({ translations }) => {
  const { allVehicles } = useVehicles();

  const latestVehicles = useMemo(() => {
    return [...allVehicles]
      .filter(vehicle => vehicle?.id && vehicle?.title && vehicle?.image)
      .sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0))
      .slice(0, 8);
  }, [allVehicles]);

  const listingCount = latestVehicles.length;

  if (listingCount === 0) {
    return null;
  }

  return (
    <section className="featured-listings" aria-labelledby="featured-title">
      <div className="container">
        <div className="featured-shell">
          <div className="featured-header">
            <div>
              <span className="featured-eyebrow">Latest ads</span>
              <h2 id="featured-title">{translations?.featured || 'Featured'}</h2>
            </div>
            <div
              className="heading-stat"
              role="status"
              aria-live="polite"
              aria-label={`${listingCount} latest ${listingCount === 1 ? 'listing' : 'listings'}`}
            >
              <div className="heading-stat-icon" aria-hidden="true">
                <Bike />
                <span className="heading-stat-live" />
              </div>
              <div className="heading-stat-body">
                <div className="heading-stat-row">
                  <span className="heading-stat-value">{listingCount.toLocaleString()}</span>
                </div>
                <span className="heading-stat-label">Latest listings</span>
                <span className="heading-stat-hint">Recently posted on BikeEeka</span>
              </div>
            </div>
          </div>

          <div className="featured-grid">
            {latestVehicles.map(vehicle => {
              const approvedRequest = vehicle.user?.membershipRequests?.find(r => r.status === 'approved') || vehicle.user?.membershipRequests?.[0];
              return (
                <article className="featured-card" key={vehicle.id}>
                <Link className="featured-card__media" to={`/vehicle/${vehicle.id}`}>
                  <img
                    src={resolveMediaUrl(vehicle.image)}
                    alt={vehicle.title}
                    loading="lazy"
                  />
                  <div className="featured-card__badges">
                    {vehicle.source === 'showroom' && (
                      <span className="featured-card__badge" style={{ background: '#0F172A', color: '#F59E0B', fontWeight: '900', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        ★ Showroom
                      </span>
                    )}
                    {vehicle.condition && (
                      <span className="featured-card__badge featured-card__badge--condition">
                        {vehicle.condition}
                      </span>
                    )}
                    {vehicle.type && (
                      <span className="featured-card__badge featured-card__badge--type">
                        {vehicle.type}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="featured-card__body">
                  <div className="featured-card__make">
                    {[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
                    {vehicle.year ? ` - ${vehicle.year}` : ''}
                  </div>

                  <h3>
                    <Link to={`/vehicle/${vehicle.id}`}>{vehicle.title}</Link>
                  </h3>

                  <div className="featured-card__meta">
                    <span>
                      <MapPin aria-hidden="true" />
                      {vehicle.location || 'Sri Lanka'}
                    </span>
                    <span>
                      <CalendarDays aria-hidden="true" />
                      {formatDate(vehicle.postedAt)}
                    </span>
                  </div>

                  {vehicle.source === 'showroom' && approvedRequest && (
                    <div className="featured-card__shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '900', color: '#0B1530', marginTop: '6px' }}>
                      <Home aria-hidden="true" style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                      <span>{approvedRequest.shopName}</span>
                      <img 
                        src={verifiedIcon} 
                        alt="Verified Showroom Partner" 
                        className="w-4 h-4 object-contain flex-shrink-0"
                        title="Verified Showroom Partner"
                      />
                    </div>
                  )}

                  <div className="featured-card__price-row">
                    <strong>{formatPrice(vehicle.price)}</strong>
                    {vehicle.mileageKm != null && (
                      <span>
                        <Gauge aria-hidden="true" />
                        {vehicle.mileageKm.toLocaleString()} km
                      </span>
                    )}
                  </div>
                </div>

                <Link className="featured-card__action" to={`/vehicle/${vehicle.id}`}>
                  View Details
                  <ArrowRight aria-hidden="true" />
                </Link>
              </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
