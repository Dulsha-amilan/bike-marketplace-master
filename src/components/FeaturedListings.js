import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Gauge, MapPin, Home, Bike, Pencil, Sparkles, Clock } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { useVehicles } from './vehiclesStore';
import { useAuth } from './AuthContext';
import BoostPostModal from './BoostPostModal';
import { LeaderboardAdBanner, SquareBoxAdBanner } from './AdBannerComponents';
import { AnimateOnScroll } from './AnimateOnScroll';
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
    <path d="M10 3.2L12.1 7.6L16.8 8.2L13.4 11.5L14.2 16.2L10 13.9L5.8 16.2L6.6 11.5L3.2 8.2L7.9 7.6L10 3.2Z" fill="#EAB308" />
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
    <circle cx="10" cy="10" r="10" fill="#F59E0B" />
    <path d="M5.5 10L10 6L14.5 10V15H5.5V10Z" fill="#0F172A" />
    <rect x="8.5" y="11.5" width="3" height="3.5" fill="#F59E0B" />
  </svg>
);

const PinnedBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M12.5 3L17 7.5L15 9.5L14.2 8.7L11.5 11.4C11.8 12.6 11.4 13.9 10.4 14.9L9.7 15.6L4.4 10.3L5.1 9.6C6.1 8.6 7.4 8.2 8.6 8.5L11.3 5.8L10.5 5L12.5 3ZM6.5 13.5L2 18" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const UrgentBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" aria-hidden="true" style={{ display: 'block' }}>
    <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
    <path d="M10 5.5V11M10 14V14.5" stroke="#EF4444" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const FeaturedListings = ({ translations, adBanner, squareBoxAd }) => {
  const { allVehicles } = useVehicles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedVehicleForBoost, setSelectedVehicleForBoost] = useState(null);
  const [navigatingId, setNavigatingId] = useState(null);

  const handleCardClick = (vehicle, event) => {
    if (event) {
      if (
        event.target.closest('.featured-card__owner-btns') ||
        event.target.closest('.featured-card__boost-btn') ||
        event.target.closest('.featured-card__edit-btn')
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }

    setNavigatingId(vehicle.id);

    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    }

    navigate(`/vehicle/${vehicle.id}`, { state: { vehicle } });
  };

  const latestVehicles = useMemo(() => {
    return [...allVehicles]
      .filter(vehicle => vehicle?.id && vehicle?.title && vehicle?.image)
      .sort((a, b) => {
        const aPinned = a.isPinned && (!a.pinnedUntil || new Date(a.pinnedUntil) > new Date()) ? 2 : 0;
        const aUrgent = a.isUrgent && (!a.urgentUntil || new Date(a.urgentUntil) > new Date()) ? 1 : 0;
        const bPinned = b.isPinned && (!b.pinnedUntil || new Date(b.pinnedUntil) > new Date()) ? 2 : 0;
        const bUrgent = b.isUrgent && (!b.urgentUntil || new Date(b.urgentUntil) > new Date()) ? 1 : 0;
        
        const aBoostScore = aPinned + aUrgent;
        const bBoostScore = bPinned + bUrgent;

        if (bBoostScore !== aBoostScore) return bBoostScore - aBoostScore;
        return new Date(b.postedAt || 0) - new Date(a.postedAt || 0);
      })
      .slice(0, 8);
  }, [allVehicles]);

  const listingCount = latestVehicles.length;

  if (listingCount === 0) {
    return null;
  }

  return (
    <>
      <section className="featured-listings" aria-labelledby="featured-title">
        <div className="container">
          <div className="featured-shell">
            {adBanner && (
              <div className="home-banner-top-wrapper" style={{ margin: '0 auto 16px auto' }}>
                <LeaderboardAdBanner ad={adBanner} />
              </div>
            )}
            <AnimateOnScroll variant="fadeUp" delay={0.05}>
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
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" staggerChildren={true} stagger={0.07} delay={0.12}>
              <div className="featured-grid">
              {latestVehicles.map((vehicle, index) => {
                const approvedRequest = vehicle.user?.membershipRequests?.find(r => r.status === 'approved') || vehicle.user?.membershipRequests?.[0];
                const isOwner = user && vehicle.userId && String(user.id) === String(vehicle.userId);
                const isApproved = !vehicle.approvalStatus || vehicle.approvalStatus === 'approved';
                const hasPendingBoost = vehicle.boostRequests?.some(r => r.status === 'pending');
                const isPinnedActive = vehicle.isPinned && (!vehicle.pinnedUntil || new Date(vehicle.pinnedUntil) > new Date());
                const isUrgentActive = vehicle.isUrgent && (!vehicle.urgentUntil || new Date(vehicle.urgentUntil) > new Date());

                const isSecond = index === 1;
                const isEverySix = index > 1 && (index + 1) % 6 === 0;
                const hasSquareBox = squareBoxAd && squareBoxAd.isEnabled !== false && squareBoxAd.isEnabled !== 0 && squareBoxAd.isEnabled !== 'false' && squareBoxAd.isEnabled !== '0';
                const showMobileSquareAd = (isSecond || isEverySix) && hasSquareBox;

                return (
                  <React.Fragment key={vehicle.id}>
                    <article 
                      className={`featured-card ${isUrgentActive ? 'featured-card--urgent' : ''} ${isPinnedActive ? 'featured-card--pinned' : ''}`}
                      onClick={(e) => handleCardClick(vehicle, e)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {navigatingId === vehicle.id && (
                        <div className="card-nav-loading-overlay">
                          <div className="card-nav-loading-badge">
                            <div className="card-nav-spinner" />
                            <span>Loading...</span>
                          </div>
                        </div>
                      )}
                      <Link
                        className="featured-card__media"
                        to={`/vehicle/${vehicle.id}`}
                        state={{ vehicle }}
                        onClick={(e) => handleCardClick(vehicle, e)}
                      >
                        <img
                          src={resolveMediaUrl(vehicle.image)}
                          alt={vehicle.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="featured-card__media-header">
                          <div className="featured-card__badges-wrap">
                            {isPinnedActive && (
                              <span className="featured-card__badge" style={{ background: '#3730A3', color: '#FFFFFF', fontWeight: '900', border: '1px solid #818CF8' }}>
                                ⭐ PINNED TOP
                              </span>
                            )}
                            {isUrgentActive && (
                              <span className="featured-card__badge" style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: '900', border: '1px solid #FCA5A5' }}>
                                🚨 URGENT
                              </span>
                            )}
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

                          {isOwner && (
                            <div className="featured-card__owner-btns">
                              {hasPendingBoost ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedVehicleForBoost(vehicle);
                                    setIsBoostModalOpen(true);
                                  }}
                                  title="Boost Request Pending Admin Approval"
                                  className="featured-card__boost-btn featured-card__boost-btn--pending"
                                >
                                  <Clock size={12} className="animate-pulse" />
                                  <span>Boost Pending</span>
                                </button>
                              ) : isApproved ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedVehicleForBoost(vehicle);
                                    setIsBoostModalOpen(true);
                                  }}
                                  title="Boost this listing"
                                  className="featured-card__boost-btn"
                                >
                                  <Sparkles size={12} color="#FFC700" />
                                  <span>Boost</span>
                                </button>
                              ) : null}

                              <button
                                type="button"
                                className="featured-card__edit-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/edit-vehicle/${vehicle.id}`);
                                }}
                                title="Edit this listing"
                                aria-label="Edit listing"
                                style={{ padding: '7px', background: '#0ea5e9', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="featured-card__body">
                        {/* Desktop Header / Make */}
                        <div className="featured-card__make featured-card__make--desktop">
                          {[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
                          {vehicle.year ? ` - ${vehicle.year}` : ''}
                        </div>

                        {/* Line 1: Title */}
                        <h3>
                          <Link
                            to={`/vehicle/${vehicle.id}`}
                            state={{ vehicle }}
                            onClick={(e) => handleCardClick(vehicle, e)}
                          >
                            {vehicle.title}
                          </Link>
                        </h3>

                        {/* Line 2 on Mobile: Mileage | Condition / Year */}
                        <div className="featured-card__subtitle-mobile">
                          {vehicle.mileageKm != null ? `${Number(vehicle.mileageKm).toLocaleString()} km` : '0 km'} | {vehicle.condition || 'Brand New'}{vehicle.year ? ` ${vehicle.year}` : ''}
                        </div>

                        {/* Line 3 on Mobile: Trust Badges */}
                        <div className="featured-card__trust-badges-mobile">
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
                        <div className="featured-card__location-mobile">
                          <span>{vehicle.location || 'Sri Lanka'}, {vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : 'Motorbikes'}</span>
                        </div>

                        {/* Line 5 on Mobile: Price & Time Ago */}
                        <div className="featured-card__price-row featured-card__price-row--mobile">
                          <div className="featured-card__price">{formatPrice(vehicle.price)}</div>
                          <span className="featured-card__time-ago">{formatTimeAgo(vehicle.postedAt)}</span>
                        </div>

                        {/* Desktop Elements */}
                        <div className="featured-card__meta featured-card__meta--desktop">
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
                          <div className="featured-card__shop featured-card__shop--desktop" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '900', color: '#0B1530', marginTop: '6px' }}>
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

                        <div className="featured-card__price-row featured-card__price-row--desktop">
                          <strong>{formatPrice(vehicle.price)}</strong>
                          {vehicle.mileageKm != null && (
                            <span>
                              <Gauge aria-hidden="true" />
                              {vehicle.mileageKm.toLocaleString()} km
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        className="featured-card__action"
                        to={`/vehicle/${vehicle.id}`}
                        state={{ vehicle }}
                        onClick={(e) => handleCardClick(vehicle, e)}
                      >
                        View Details
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </article>
                    {showMobileSquareAd && (
                      <div className="mobile-infeed-ad-wrapper">
                        <SquareBoxAdBanner ad={squareBoxAd} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Boost Post Modal Component */}
      <BoostPostModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        vehicle={selectedVehicleForBoost}
      />
    </>
  );
};

export default FeaturedListings;
