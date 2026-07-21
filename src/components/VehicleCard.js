// components/VehicleCard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiX, FiHome } from 'react-icons/fi';
import { Activity, Camera, Cpu, Droplet, Zap } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import './VehicleCard.css';
import verifiedIcon from '../Images/verififedbutton.png';

const formatPrice = price => {
  if (price == null) return 'Negotiable';
  return `Rs: ${price.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
};

const toISODate = date => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toISOString().slice(0, 10);
};

const VehicleCard = ({ vehicle, horizontal = false }) => {
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
  const allImages = [image, ...(gallery || [])].filter(Boolean).map(resolveMediaUrl);
  const makeLine = [vehicle.make, vehicle.model].filter(Boolean).join(' ');
  const approvedRequest = vehicle.user?.membershipRequests?.find(r => r.status === 'approved') || vehicle.user?.membershipRequests?.[0];

  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  const openLightbox = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsLightboxOpen(true);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = event => {
    event.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % allImages.length);
  };

  const prevImage = event => {
    event.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentImageIndex(prev => (prev + 1) % allImages.length);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  const specItems = [
    vehicle.engineCapacityCc && {
      key: 'engine',
      Icon: Zap,
      className: 'vehicle-card__spec-icon--amber',
      label: `${vehicle.engineCapacityCc} cc`,
    },
    vehicle.fuelType && {
      key: 'fuel',
      Icon: Droplet,
      className: 'vehicle-card__spec-icon--blue',
      label: vehicle.fuelType,
    },
    vehicle.transmission && {
      key: 'transmission',
      Icon: Cpu,
      className: 'vehicle-card__spec-icon--violet',
      label: vehicle.transmission,
    },
    mileageKm != null && {
      key: 'mileage',
      Icon: Activity,
      className: 'vehicle-card__spec-icon--green',
      label: `${mileageKm.toLocaleString()} km`,
    },
  ].filter(Boolean);

  if (horizontal) {
    return (
      <>
        <Card className="vehicle-card vehicle-card--ad">
          <button
            className="vehicle-card__media"
            onClick={openLightbox}
            type="button"
            aria-label={`Open photos for ${title}`}
          >
            <img
              src={resolveMediaUrl(image)}
              alt={title}
              loading="lazy"
              className="vehicle-card__image"
            />
            <span className="vehicle-card__media-shade" aria-hidden="true" />
            <div className="vehicle-card__badges">
              {vehicle.source === 'showroom' && (
                <span className="vehicle-card__badge" style={{ background: '#0F172A', color: '#F59E0B', fontWeight: '900', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  ★ Showroom
                </span>
              )}
              {vehicle.condition && (
                <span className="vehicle-card__badge vehicle-card__badge--new">
                  {vehicle.condition}
                </span>
              )}
              {vehicle.type && (
                <span className="vehicle-card__badge vehicle-card__badge--type">
                  {vehicle.type}
                </span>
              )}
            </div>
            {allImages.length > 1 && (
              <span className="vehicle-card__photo-count">
                <Camera aria-hidden="true" />
                {allImages.length} photos
              </span>
            )}
          </button>

          <div className="vehicle-card__main">
            <div className="vehicle-card__details">
              <div className="vehicle-card__make">
                {makeLine || 'Bike'}
                {vehicle.year ? ` - ${vehicle.year}` : ''}
              </div>
              <h3 className="vehicle-card__title">{title}</h3>
              <div className="vehicle-card__location">
                <FiMapPin aria-hidden="true" />
                <span>{location || 'Sri Lanka'}</span>
              </div>
              {vehicle.source === 'showroom' && approvedRequest && (
                <div className="vehicle-card__shop-info" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '12px', fontWeight: '900', color: '#0B1530' }}>
                  <FiHome aria-hidden="true" style={{ color: '#F59E0B', width: '14px', height: '14px' }} />
                  <span className="truncate">{approvedRequest.shopName}</span>
                  <img 
                    src={verifiedIcon} 
                    alt="Verified Showroom Partner" 
                    className="w-4 h-4 object-contain flex-shrink-0"
                    title="Verified Showroom Partner"
                  />
                </div>
              )}

              <div className="vehicle-card__price-row vehicle-card__price-row--mobile">
                <div>
                  <span className="vehicle-card__price-label">Price</span>
                  <div className="vehicle-card__price">{formatPrice(price)}</div>
                </div>
                {vehicle.registerYear && (
                  <span className="vehicle-card__reg">Reg: {vehicle.registerYear}</span>
                )}
              </div>

              <div className="vehicle-card__specs" aria-label="Vehicle specifications">
                {specItems.map(({ key, Icon, className, label }) => (
                  <span key={key} className="vehicle-card__spec">
                    <Icon className={`vehicle-card__spec-icon ${className}`} aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="vehicle-card__summary">
              <div className="vehicle-card__price-row vehicle-card__price-row--desktop">
                <div>
                  <span className="vehicle-card__price-label">Price</span>
                  <div className="vehicle-card__price">{formatPrice(price)}</div>
                </div>
                {vehicle.registerYear && (
                  <span className="vehicle-card__reg">Reg: {vehicle.registerYear}</span>
                )}
              </div>

              <div className="vehicle-card__posted">
                <FiCalendar aria-hidden="true" />
                <span>Posted: {toISODate(postedAt)}</span>
              </div>

              <Button asChild className="vehicle-card__button" size="sm">
                <Link to={`/vehicle/${id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </Card>

        {isLightboxOpen && (
          <VehicleLightbox
            allImages={allImages}
            title={title}
            currentImageIndex={currentImageIndex}
            closeLightbox={closeLightbox}
            prevImage={prevImage}
            nextImage={nextImage}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card className="vehicle-card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-border/50 hover:-translate-y-1 bg-card max-w-sm w-full mx-auto">
        <div className="vehicle-media relative aspect-[16/9] overflow-hidden cursor-pointer bg-gray-900" onClick={openLightbox}>
          <img
            src={resolveMediaUrl(image)}
            alt={title}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 left-2 flex gap-1.5 z-10">
            {vehicle.source === 'showroom' && (
              <span className="bg-[#0F172A] text-amber-400 text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                ★ Showroom
              </span>
            )}
            {vehicle.condition && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                {vehicle.condition}
              </span>
            )}
            {vehicle.type && (
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide capitalize">
                {vehicle.type}
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse"></span>
              {allImages.length} photos
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-grow flex flex-col gap-3.5">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>

            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {makeLine} {vehicle.year ? `- ${vehicle.year}` : ''}
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <FiMapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            {vehicle.source === 'showroom' && approvedRequest && (
              <div className="text-xs text-slate-900 font-black flex items-center gap-1 mt-0.5">
                <FiHome className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{approvedRequest.shopName}</span>
                <img 
                  src={verifiedIcon} 
                  alt="Verified Showroom Partner" 
                  className="w-4 h-4 object-contain flex-shrink-0"
                  title="Verified Showroom Partner"
                />
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-xl font-bold text-primary">{formatPrice(price)}</div>
            {vehicle.registerYear && (
              <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md font-medium border border-border/30">
                Reg: {vehicle.registerYear}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 mb-2 text-xs">
            {specItems.map(({ key, Icon, className, label }) => (
              <div key={key} className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/30">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${className}`} />
                <span className="truncate text-muted-foreground font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground pt-3 border-t border-border/30 mt-auto">
            <span className="flex items-center gap-1">
              <FiCalendar className="w-3.5 h-3.5 text-muted-foreground/80" />
              Posted: {toISODate(postedAt)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full font-medium shadow-sm hover:shadow-md transition-all rounded-lg" size="lg">
            <Link to={`/vehicle/${id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>

      {isLightboxOpen && (
        <VehicleLightbox
          allImages={allImages}
          title={title}
          currentImageIndex={currentImageIndex}
          closeLightbox={closeLightbox}
          prevImage={prevImage}
          nextImage={nextImage}
        />
      )}
    </>
  );
};

const VehicleLightbox = ({
  allImages,
  title,
  currentImageIndex,
  closeLightbox,
  prevImage,
  nextImage,
}) => (
  <div className="image-lightbox" onClick={closeLightbox}>
    <button className="lightbox-close" onClick={closeLightbox} aria-label="Close" type="button">
      <FiX />
    </button>
    {allImages.length > 1 && (
      <>
        <button className="lightbox-nav lightbox-prev" onClick={prevImage} aria-label="Previous" type="button">
          {'<'}
        </button>
        <button className="lightbox-nav lightbox-next" onClick={nextImage} aria-label="Next" type="button">
          {'>'}
        </button>
        <div className="lightbox-counter">
          {currentImageIndex + 1} / {allImages.length}
        </div>
      </>
    )}
    <div className="lightbox-content" onClick={event => event.stopPropagation()}>
      <img
        src={allImages[currentImageIndex]}
        alt={`${title} - ${currentImageIndex + 1}`}
        className="lightbox-image"
      />
    </div>
  </div>
);

export default VehicleCard;
