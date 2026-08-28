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

const formatTimeAgo = date => {
  if (!date) return 'Recently';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  const now = new Date();
  const diffMs = now - parsed;
  if (diffMs < 0) return 'Just now';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
};

const MemberBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M10 3.2L12.1 7.6L16.8 8.2L13.4 11.5L14.2 16.2L10 13.9L5.8 16.2L6.6 11.5L3.2 8.2L7.9 7.6L10 3.2Z" fill="#FFD600" />
  </svg>
);

const VerifiedBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M5.8 10.2L8.6 13L14.4 7.2" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShowroomBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFD600" />
    <path d="M5.5 10L10 6L14.5 10V15H5.5V10Z" fill="#0A0B10" />
    <rect x="8.5" y="11.5" width="3" height="3.5" fill="#FFD600" />
  </svg>
);

const PinnedBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M12.5 3L17 7.5L15 9.5L14.2 8.7L11.5 11.4C11.8 12.6 11.4 13.9 10.4 14.9L9.7 15.6L4.4 10.3L5.1 9.6C6.1 8.6 7.4 8.2 8.6 8.5L11.3 5.8L10.5 5L12.5 3ZM6.5 13.5L2 18" stroke="#FFD600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const UrgentBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M10 5.5V11M10 14V14.5" stroke="#E50914" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

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
  const [isNavigating, setIsNavigating] = useState(false);

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

  const navigateToDetails = event => {
    if (event) {
      if (
        event.target.closest('.vehicle-card__owner-btns') ||
        event.target.closest('.vehicle-card__boost-btn') ||
        event.target.closest('.vehicle-card__edit-btn')
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }

    setIsNavigating(true);

    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    }

    navigate(`/vehicle/${id}`, { state: { vehicle } });
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
        <Card 
          className={`vehicle-card vehicle-card--ad ${isUrgentActive ? 'vehicle-card--urgent' : ''} ${isPinnedActive ? 'vehicle-card--pinned' : ''}`}
          onClick={navigateToDetails}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          {isNavigating && (
            <div className="card-nav-loading-overlay">
              <div className="card-nav-loading-badge">
                <div className="card-nav-spinner" />
                <span>Loading...</span>
              </div>
            </div>
          )}
          <button
            className="vehicle-card__media"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.innerWidth <= 820) {
                navigateToDetails(e);
              } else {
                openLightbox(e);
              }
            }}
            type="button"
            aria-label={`View details for ${title}`}
          >
            <img
              src={resolveMediaUrl(image)}
              alt={title}
              loading="lazy"
              className="vehicle-card__image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="vehicle-card__media-header">
              <div className="vehicle-card__badges-wrap">
                {isPinnedActive && (
                  <span className="vehicle-card__badge" style={{ background: '#0A0B10', color: '#FFD600', fontWeight: '900', border: '1px solid #FFD600' }}>
                    ⭐ PINNED TOP
                  </span>
                )}
                {isUrgentActive && (
                  <span className="vehicle-card__badge" style={{ background: '#E50914', color: '#FFFFFF', fontWeight: '900', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
                    🚨 URGENT
                  </span>
                )}
                {vehicle.source === 'showroom' && (
                  <span className="vehicle-card__badge" style={{ background: '#0A0B10', color: '#FFD600', fontWeight: '900', border: '1px solid rgba(255, 214, 0, 0.5)' }}>
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

              {isOwner && (
                <div className="vehicle-card__owner-btns">
                  {hasPendingBoost ? (
                    <button
                      type="button"
                      className="vehicle-card__boost-btn vehicle-card__boost-btn--pending"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                      title="Boost Request Pending Admin Approval"
                    >
                      <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>Boost Pending</span>
                    </button>
                  ) : isApproved ? (
                    <button
                      type="button"
                      className="vehicle-card__boost-btn"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                      title="Boost this listing"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Boost</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="vehicle-card__edit-btn"
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
              <span className="vehicle-card__photo-count">
                <Camera aria-hidden="true" />
                {allImages.length} photos
              </span>
            )}
          </button>

          <div className="vehicle-card__main" onClick={navigateToDetails} style={{ cursor: 'pointer' }}>
            <div className="vehicle-card__details">
              {/* Desktop Header / Make */}
              <div className="vehicle-card__make vehicle-card__make--desktop">
                {makeLine || 'Bike'}
                {vehicle.year ? ` - ${vehicle.year}` : ''}
              </div>

              {/* Line 1: Title */}
              <h3 className="vehicle-card__title">
                <Link to={`/vehicle/${id}`} onClick={navigateToDetails}>{title}</Link>
              </h3>

              {/* Line 2 on Mobile: Mileage | Condition / Year */}
              <div className="vehicle-card__subtitle-mobile">
                {mileageVal != null ? `${Number(mileageVal).toLocaleString()} km` : '0 km'} | {vehicle.condition || 'Brand New'}{vehicle.year ? ` ${vehicle.year}` : ''}
              </div>

              {/* Line 3 on Mobile: Trust Badges */}
              <div className="vehicle-card__trust-badges-mobile">
                {vehicle.source === 'showroom' && approvedRequest ? (
                  <span className="trust-badge trust-badge--showroom">
                    <ShowroomBadgeIcon />
                    <span>SHOWROOM</span>
                  </span>
                ) : (
                  <span className="trust-badge trust-badge--member">
                    <MemberBadgeIcon />
                    <span>MEMBER</span>
                  </span>
                )}
                <span className="trust-badge trust-badge--verified">
                  <VerifiedBadgeIcon />
                  <span>VERIFIED SELLER</span>
                </span>
                {isPinnedActive && (
                  <span className="trust-badge trust-badge--pinned">
                    <PinnedBadgeIcon />
                    <span>PINNED</span>
                  </span>
                )}
                {isUrgentActive && (
                  <span className="trust-badge trust-badge--urgent">
                    <UrgentBadgeIcon />
                    <span>URGENT</span>
                  </span>
                )}
              </div>

              {/* Line 4 on Mobile: Location, Category */}
              <div className="vehicle-card__location-mobile">
                <span>{location || 'Sri Lanka'}, {vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : 'Motorbikes'}</span>
              </div>

              {/* Line 5 on Mobile: Price & Time Ago */}
              <div className="vehicle-card__price-row vehicle-card__price-row--mobile">
                <div className="vehicle-card__price">{formatPrice(price)}</div>
                <span className="vehicle-card__time-ago">{formatTimeAgo(postedAt)}</span>
              </div>

              {/* Desktop-only meta list */}
              <div className="vehicle-card__meta-list vehicle-card__meta-list--desktop">
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
                <p className="vehicle-card__description vehicle-card__description--desktop">
                  {description}
                </p>
              )}

              {/* Desktop-only specs */}
              <div className="vehicle-card__specs vehicle-card__specs--desktop" aria-label="Vehicle specifications">
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
                <span>Posted: {formatTimeAgo(postedAt)}</span>
              </div>

              <Button asChild className="vehicle-card__button" size="sm">
                <Link
                  to={`/vehicle/${id}`}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    if (document.documentElement) document.documentElement.scrollTop = 0;
                    if (document.body) document.body.scrollTop = 0;
                    if (window.__lenis) {
                      window.__lenis.scrollTo(0, { immediate: true, force: true });
                    }
                  }}
                >
                  View Details
                </Link>
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
      <Card 
        className={`vehicle-card overflow-hidden hover:shadow-xl transition-all duration-300 ${isPreview ? '' : 'h-full'} flex flex-col group border-border/50 hover:-translate-y-1 bg-card max-w-sm w-full mx-auto ${isUrgentActive ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/25' : ''} ${isPinnedActive ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/25' : ''}`}
        onClick={isPreview ? undefined : navigateToDetails}
        style={{ cursor: isPreview ? 'default' : 'pointer', position: 'relative' }}
      >
        {isNavigating && (
          <div className="card-nav-loading-overlay">
            <div className="card-nav-loading-badge">
              <div className="card-nav-spinner" />
              <span>Loading...</span>
            </div>
          </div>
        )}
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

          <div className="vehicle-card__media-header">
            <div className="vehicle-card__badges-wrap">
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
            </div>

            {isOwner && (
              <div className="vehicle-card__owner-btns">
                {hasPendingBoost ? (
                  <button
                    type="button"
                    className="vehicle-card__boost-btn vehicle-card__boost-btn--pending"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost Request Pending Admin Approval"
                  >
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Boost Pending</span>
                  </button>
                ) : isApproved ? (
                  <button
                    type="button"
                    className="vehicle-card__boost-btn"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoostModalOpen(true); }}
                    title="Boost this listing"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Boost</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className="vehicle-card__edit-btn"
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
            <Link
              to={`/vehicle/${id}`}
              state={{ vehicle }}
              onClick={navigateToDetails}
            >
              View Details
            </Link>
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
