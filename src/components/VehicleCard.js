// components/VehicleCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiX } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './VehicleCard.css';

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
    gallery = [],
  } = vehicle;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images (main image + gallery)
  const allImages = [image, ...(gallery || [])].filter(Boolean).map(resolveMediaUrl);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  const openLightbox = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLightboxOpen(true);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  return (
    <>
      <article className="vehicle-card1">
        <div className="vehicle-media">
          <img 
            src={resolveMediaUrl(image)} 
            alt={title} 
            loading="lazy" 
            onClick={openLightbox}
            className="vehicle-image-clickable"
            style={{ cursor: 'pointer' }}
          />
          {allImages.length > 1 && (
            <div className="image-count-badge">
              {allImages.length} photos
            </div>
          )}
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

      {isLightboxOpen && (
        <div className="image-lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            <FiX />
          </button>
          {allImages.length > 1 && (
            <>
              <button className="lightbox-nav lightbox-prev" onClick={prevImage} aria-label="Previous">
                ‹
              </button>
              <button className="lightbox-nav lightbox-next" onClick={nextImage} aria-label="Next">
                ›
              </button>
              <div className="lightbox-counter">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={allImages[currentImageIndex]} 
              alt={`${title} - ${currentImageIndex + 1}`}
              className="lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleCard;