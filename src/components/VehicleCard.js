// components/VehicleCard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiX, FiHome, FiPhone, FiUser } from 'react-icons/fi';
import { Activity, Bike, Camera, Cpu, Droplet, Pencil, Zap, Sparkles, Clock } from 'lucide-react';
import BoostPostModal from './BoostPostModal';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import './VehicleCard.css';
import verifiedIcon from '../Images/verififedbutton.png';

const formatPrice = price => {
  if (price == null || price === '') return 'Negotiable';
  const num = Number(price);
  if (isNaN(num)) return 'Negotiable';
  return `Rs: ${num.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
};

const toISODate = date => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toISOString().slice(0, 10);
};

const VehicleLightbox = ({ allImages, title, currentImageIndex, closeLightbox, prevImage, nextImage }) => (
  <div
    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
    onClick={closeLightbox}
  >
    <button
      type="button"
      className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      onClick={closeLightbox}
      aria-label="Close photo view"
    >
      <FiX className="w-6 h-6" />
    </button>

    <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
      <img
        src={allImages[currentImageIndex]}
        alt={`${title} ${currentImageIndex + 1}`}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
      />

      {allImages.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 md:left-4 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
            onClick={prevImage}
            aria-label="Previous photo"
          >
            &#10094;
          </button>
          <button
            type="button"
            className="absolute right-2 md:right-4 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
            onClick={nextImage}
            aria-label="Next photo"
          >
            &#10095;
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </>
      )}
    </div>
  </div>
);

const VehicleCard = ({ vehicle, horizontal = false, isPreview = false }) => {
  const {
    id,
    title,
    price,
    postedAt,
    location,
    image,
    gallery = [],
    description,
  } = vehicle;

  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = !isPreview && user && vehicle.userId && String(user.id) === String(vehicle.userId);
  const isApproved = !vehicle.approvalStatus || vehicle.approvalStatus === 'approved';
  const hasPendingBoost = vehicle.boostRequests?.some(r => r.status === 'pending');
  const isPinnedActive = vehicle.isPinned && (!vehicle.pinnedUntil || new Date(vehicle.pinnedUntil) > new Date());
  const isUrgentActive = vehicle.isUrgent && (!vehicle.urgentUntil || new Date(vehicle.urgentUntil) > new Date());

  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
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

  const mileageVal = vehicle.mileageKm ?? vehicle.mileage;

  const specItems = [
    (vehicle.engineCapacityCc || vehicle.engineCc) && {
      key: 'engine',
      Icon: Zap,
      className: 'vehicle-card__spec-icon--amber',
      label: `${vehicle.engineCapacityCc || vehicle.engineCc} cc`,
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
    mileageVal != null && mileageVal !== '' && {
      key: 'mileage',
      Icon: Activity,
      className: 'vehicle-card__spec-icon--green',
      label: `${Number(mileageVal).toLocaleString()} km`,
    },
  ].filter(Boolean);

  if (horizontal) {
    const displayPhone = vehicle.phone || vehicle.user?.phone;
    const sellerName = vehicle.user?.name;

    return (
      <>
        <Card className={`vehicle-card vehicle-card--ad ${isUrgentActive ? 'vehicle-card--urgent' : ''} ${isPinnedActive ? 'vehicle-card--pinned' : ''}`}>
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
              {isPinnedActive && (
                <span className="vehicle-card__badge" style={{ background: '#3730A3', color: '#FFFFFF', fontWeight: '900', border: '1px solid #818CF8' }}>
                  ⭐ PINNED TOP
                </span>
              )}
              {isUrgentActive && (
                <span className="vehicle-card__badge" style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: '900', border: '1px solid #FCA5A5' }}>
                  🚨 URGENT
                </span>
              )}
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
            {isOwner && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
                {hasPendingBoost ? (
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-[10px] rounded-full shadow-lg border border-amber-400/50 flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost Request Pending Admin Approval"
                  >
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Boost Pending</span>
                  </button>
                ) : isApproved ? (
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-[#0B1530] hover:bg-slate-800 text-amber-400 font-extrabold text-[10px] rounded-full shadow-lg hover:scale-105 transition-all border border-amber-400/40 flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost this listing"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Boost</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/edit-vehicle/${id}`); }}
                  title="Edit this listing"
                  aria-label="Edit listing"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </button>

          <div className="vehicle-card__main">
            <div className="vehicle-card__details">
              <div className="vehicle-card__make">
                {makeLine || 'Bike'}
                {vehicle.year ? ` - ${vehicle.year}` : ''}
              </div>
              <h3 className="vehicle-card__title">{title}</h3>
              
              <div className="vehicle-card__meta-list">
                <div className="vehicle-card__meta-item">
                  <FiMapPin className="meta-icon" aria-hidden="true" />
                  <span className="meta-label">Location:</span>
                  <span className="meta-value">{location || 'Sri Lanka'}</span>
                </div>

                {sellerName && (
                  <div className="vehicle-card__meta-item">
                    <FiUser className="meta-icon" aria-hidden="true" />
                    <span className="meta-label">Seller:</span>
                    <span className="meta-value">{sellerName}</span>
                  </div>
                )}

                {displayPhone && (
                  <div className="vehicle-card__meta-item">
                    <FiPhone className="meta-icon" aria-hidden="true" />
                    <span className="meta-label">Contact:</span>
                    <span className="meta-value">{displayPhone}</span>
                  </div>
                )}

                {vehicle.source === 'showroom' && approvedRequest && (
                  <div className="vehicle-card__shop-info">
                    {approvedRequest.shopImage ? (
                      <img 
                        src={resolveMediaUrl(approvedRequest.shopImage)} 
                        alt={approvedRequest.shopName}
                        className="vehicle-card__shop-logo"
                      />
                    ) : (
                      <FiHome aria-hidden="true" style={{ color: '#F59E0B', width: '15px', height: '15px' }} />
                    )}
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

              {description && (
                <p className="vehicle-card__description">
                  {description}
                </p>
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

        <BoostPostModal
          isOpen={isBoostModalOpen}
          onClose={() => setIsBoostModalOpen(false)}
          vehicle={vehicle}
        />
      </>
    );
  }

  return (
    <>
      <Card className={`vehicle-card overflow-hidden hover:shadow-xl transition-all duration-300 ${isPreview ? '' : 'h-full'} flex flex-col group border-border/50 hover:-translate-y-1 bg-card max-w-sm w-full mx-auto ${isUrgentActive ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/25' : ''} ${isPinnedActive ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/25' : ''}`}>
        <div 
          className={`vehicle-media relative aspect-[16/9] overflow-hidden ${isPreview ? 'cursor-default' : 'cursor-pointer'} bg-gray-900`} 
          onClick={isPreview ? undefined : openLightbox}
        >
          {allImages.length > 0 ? (
            <img
              src={resolveMediaUrl(allImages[0])}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/60 p-6 text-center w-full h-full bg-muted/20">
              <Bike className="w-12 h-12 stroke-[1.2] text-muted-foreground/30 animate-bounce" />
              <span className="text-xs font-medium">No Cover Photo Selected</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10 max-w-[85%]">
            {isPinnedActive && (
              <span className="bg-indigo-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider border border-indigo-400 flex items-center gap-1">
                ⭐ PINNED
              </span>
            )}
            {isUrgentActive && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider border border-red-300 flex items-center gap-1 animate-pulse">
                🚨 URGENT
              </span>
            )}
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
            {isOwner && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
                {hasPendingBoost ? (
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-[10px] rounded-full shadow-lg border border-amber-400/50 flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost Request Pending Admin Approval"
                  >
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Boost Pending</span>
                  </button>
                ) : isApproved ? (
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-[#0B1530] hover:bg-slate-800 text-amber-400 font-extrabold text-[10px] rounded-full shadow-lg hover:scale-105 transition-all border border-amber-400/40 flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost this listing"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Boost</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/edit-vehicle/${id}`); }}
                  title="Edit this listing"
                  aria-label="Edit listing"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
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
                {approvedRequest.shopImage ? (
                  <img 
                    src={resolveMediaUrl(approvedRequest.shopImage)} 
                    alt={approvedRequest.shopName}
                    className="w-4 h-4 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <FiHome className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
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

          {specItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
              {specItems.slice(0, 4).map(({ key, Icon, className, label }) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${className}`} />
                  <span className="truncate font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">Price</span>
            <span className="text-base font-black text-foreground">{formatPrice(price)}</span>
          </div>

          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
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

      <BoostPostModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        vehicle={vehicle}
      />
    </>
  );
};

export default VehicleCard;
