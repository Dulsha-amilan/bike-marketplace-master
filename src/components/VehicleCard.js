// components/VehicleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar } from 'react-icons/fi';

const formatPrice = price => {
  if (price == null) return 'Negotiable';
  return `Rs: ${price.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
};

const toISODate = d => new Date(d).toISOString().slice(0, 10);

const VehicleCard = ({ vehicle }) => {
  const {
    id,
    title,
    price,
    postedAt,
    location,
    mileageKm,
    image,
  } = vehicle;

  return (
    <article className="vehicle-card1">
      <div className="vehicle-media">
        <img src={image} alt={title} loading="lazy" />
      </div>

      <div className="vehicle-body">
        <h3 className="vehicle-title">{title}</h3>

        <div className="vehicle-price">{formatPrice(price)}</div>

        <div className="vehicle-meta">
          <span className="meta-item">
            <FiCalendar aria-hidden="true" /> {toISODate(postedAt)}
          </span>
          <span className="meta-item">
            <FiMapPin aria-hidden="true" /> {location}
          </span>
          {mileageKm != null && (
            <span className="meta-item">{mileageKm.toLocaleString()} km</span>
          )}
        </div>
      </div>

      <div className="vehicle-cta">
        <Link to={`/vehicle/${id}`} className="btn btn-outline">Find out more</Link>
      </div>
    </article>
  );
};

export default VehicleCard;