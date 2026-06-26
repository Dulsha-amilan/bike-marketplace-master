// components/VehicleCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiX } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
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
      <Card className="vehicle-card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-border/50 hover:-translate-y-1 bg-card">
        <div className="vehicle-media relative aspect-[16/9] overflow-hidden cursor-pointer bg-gray-900" onClick={openLightbox}>
          <img
            src={resolveMediaUrl(image)}
            alt={title}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge for condition or status could go here */}
          <div className="absolute top-2 left-2 flex gap-1">
            {vehicle.condition === 'New' && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">New</span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse"></span>
              {allImages.length} photos
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-grow flex flex-col gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">{title}</h3>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <FiMapPin className="w-3.5 h-3.5" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          <div className="text-2xl font-bold text-primary mt-1">{formatPrice(price)}</div>

          <div className="vehicle-meta grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-muted-foreground mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" />
              <span>{toISODate(postedAt)}</span>
            </div>
            {mileageKm != null && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">K</span>
                <span>{mileageKm.toLocaleString()} km</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full font-semibold shadow-sm hover:shadow-md transition-all rounded-lg" size="lg">
            <Link to={`/vehicle/${id}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>

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
