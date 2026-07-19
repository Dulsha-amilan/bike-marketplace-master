// components/FeaturedListings.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Gauge, MapPin } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { useVehicles } from './vehiclesStore';
import './FeaturedListings.css';

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

  if (latestVehicles.length === 0) {
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
            <div className="featured-count" aria-label={`${latestVehicles.length} latest listings`}>
              <strong>{latestVehicles.length}</strong>
              <span>Latest listings</span>
            </div>
          </div>

          <div className="featured-grid">
            {latestVehicles.map(vehicle => (
              <article className="featured-card" key={vehicle.id}>
                <Link className="featured-card__media" to={`/vehicle/${vehicle.id}`}>
                  <img
                    src={resolveMediaUrl(vehicle.image)}
                    alt={vehicle.title}
                    loading="lazy"
                  />
                  <div className="featured-card__badges">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
