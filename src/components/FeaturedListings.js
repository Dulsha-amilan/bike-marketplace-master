// components/FeaturedListings.js
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Gauge, MapPin, Home, Bike, Pencil, Sparkles, Clock } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { useVehicles } from './vehiclesStore';
import { useAuth } from './AuthContext';
import BoostPostModal from './BoostPostModal';
import { LeaderboardAdBanner, SquareBoxAdBanner } from './AdBannerComponents';
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

const FeaturedListings = ({ translations, adBanner, squareBoxAd }) => {
  const { allVehicles } = useVehicles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedVehicleForBoost, setSelectedVehicleForBoost] = useState(null);

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
                    >
                      <Link className="featured-card__media" to={`/vehicle/${vehicle.id}`}>
                        <img
                          src={resolveMediaUrl(vehicle.image)}
                          alt={vehicle.title}
                          loading="lazy"
                        />
                        <div className="featured-card__badges" style={{ maxWidth: isOwner ? 'calc(100% - 125px)' : '100%' }}>
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
                          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                                style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.95)', color: '#000', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
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
                                style={{ padding: '4px 10px', background: '#0B1530', color: '#FFC700', borderRadius: '999px', border: '1px solid rgba(255,199,0,0.4)', cursor: 'pointer', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
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
                              style={{ padding: '7px', background: '#0ea5e9', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
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
                    {showMobileSquareAd && (
                      <div className="mobile-infeed-ad-wrapper">
                        <SquareBoxAdBanner ad={squareBoxAd} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
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
