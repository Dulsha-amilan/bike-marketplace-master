import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Fuel,
  Gauge,
  Heart,
  Home,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Settings,
  Share2,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { getVehicleById } from '../api/bikeApi';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './VehicleDetails.css';
import verifiedIcon from '../Images/verififedbutton.png';

const hasValue = value => value !== undefined && value !== null && value !== '';

const formatNumber = value => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return number.toLocaleString('en-LK', { maximumFractionDigits: 0 });
};

const formatPrice = price => (hasValue(price) ? `Rs: ${formatNumber(price)}` : 'Negotiable');

const formatDate = date => {
  if (!date) return 'Recently';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toISOString().slice(0, 10);
};

const onlyDigits = value => (value || '').replace(/\D/g, '');

const whatsappPhoneFromLK = phone => {
  const digits = onlyDigits(phone);
  if (!digits) return '';
  if (digits.startsWith('0')) return `94${digits.slice(1)}`;
  return digits.startsWith('94') ? digits : `94${digits}`;
};

const formatMileage = value => (hasValue(value) ? `${formatNumber(value)} km` : null);
const formatEngine = value => (hasValue(value) ? `${formatNumber(value)} cc` : null);

const getInitials = name => {
  if (!name) return 'BE';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'BE';
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
};

const buildDescription = vehicle => {
  const makeLine = [vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'bike';
  const condition = vehicle.condition ? `${vehicle.condition.toLowerCase()} ` : '';
  const year = vehicle.year ? ` from ${vehicle.year}` : '';
  const location = vehicle.location ? ` in ${vehicle.location}` : '';
  const mileage = hasValue(vehicle.mileageKm)
    ? ` It has done approximately ${formatNumber(vehicle.mileageKm)} km.`
    : '';

  return `This ${condition}${makeLine}${year} is listed${location}.${mileage} Contact the seller to confirm availability, documents, inspection time, and final price.`;
};

const VehicleDetails = ({ allVehicles = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);
  const [remoteVehicle, setRemoteVehicle] = useState(null);
  const [remoteError, setRemoteError] = useState('');
  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIdx(0);
    setShareMessage('');
  }, [id]);

  const vehicle = useMemo(
    () => allVehicles.find(v => String(v.id) === String(id)),
    [allVehicles, id]
  );

  useEffect(() => {
    let alive = true;
    setRemoteError('');

    if (!vehicle && id) {
      getVehicleById(id)
        .then(data => {
          if (!alive) return;
          setRemoteVehicle(data);
        })
        .catch(error => {
          if (!alive) return;
          console.error(error);
          setRemoteError('Failed to load listing from server.');
          setRemoteVehicle(null);
        });
    } else {
      setRemoteVehicle(null);
    }

    return () => {
      alive = false;
    };
  }, [vehicle, id]);

  const activeVehicle = vehicle || remoteVehicle;

  const photos = useMemo(() => {
    if (!activeVehicle) return [];
    const gallery = activeVehicle.gallery?.length ? activeVehicle.gallery : [activeVehicle.image];
    return gallery.filter(Boolean).map(resolveMediaUrl);
  }, [activeVehicle]);

  const activePhoto = photos[idx] || photos[0] || '';

  const approvedRequest = useMemo(() => {
    if (!activeVehicle?.user) return null;
    return activeVehicle.user.membershipRequests?.find(r => r.status === 'approved')
      || activeVehicle.user.membershipRequests?.[0]
      || null;
  }, [activeVehicle]);

  const isShowroom = activeVehicle?.source === 'showroom' && approvedRequest;
  const sellerName = isShowroom
    ? approvedRequest.shopName
    : activeVehicle?.user?.name || activeVehicle?.sellerName || 'Private Seller';
  const sellerEmail = isShowroom
    ? approvedRequest.email
    : activeVehicle?.user?.email || activeVehicle?.email;
  const sellerPhone = isShowroom && approvedRequest?.phone ? approvedRequest.phone : activeVehicle?.phone;
  const phoneDigits = onlyDigits(sellerPhone);
  const whatsappNumber = whatsappPhoneFromLK(sellerPhone);
  const makeLine = [activeVehicle?.make, activeVehicle?.model].filter(Boolean).join(' ');
  const postedDate = formatDate(activeVehicle?.postedAt);
  const listingTitle = activeVehicle?.title || makeLine || 'Vehicle listing';
  const sellerAvatar = isShowroom && approvedRequest?.shopImage ? resolveMediaUrl(approvedRequest.shopImage) : '';
  const sellerCover = isShowroom && approvedRequest?.coverImage ? resolveMediaUrl(approvedRequest.coverImage) : '';
  const sellerTypeLabel = isShowroom ? 'Verified Showroom Dealer' : 'Registered Private Seller';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMessage = encodeURIComponent(`Hi, I am interested in your ${listingTitle} listed on BikeEka.`);
  const emailSubject = encodeURIComponent(`Inquiry about ${listingTitle}`);
  const emailBody = encodeURIComponent(`Hi, I am interested in your ${listingTitle} listed on BikeEka. Is it still available?`);

  const heroFacts = [
    { label: 'Year', value: activeVehicle?.year || 'Not listed' },
    { label: 'Engine', value: formatEngine(activeVehicle?.engineCapacityCc) || 'Not listed' },
    { label: 'Mileage', value: formatMileage(activeVehicle?.mileageKm) || 'Not listed' },
  ];

  const specItems = [
    { icon: Bike, label: 'Make', value: activeVehicle?.make },
    { icon: Wrench, label: 'Model', value: activeVehicle?.model },
    { icon: Calendar, label: 'Year', value: activeVehicle?.year },
    { icon: Calendar, label: 'Registered', value: activeVehicle?.registerYear },
    { icon: Gauge, label: 'Mileage', value: formatMileage(activeVehicle?.mileageKm) },
    { icon: Settings, label: 'Engine', value: formatEngine(activeVehicle?.engineCapacityCc) },
    { icon: Settings, label: 'Transmission', value: activeVehicle?.transmission },
    { icon: Fuel, label: 'Fuel Type', value: activeVehicle?.fuelType },
    { icon: Layers, label: 'Condition', value: activeVehicle?.condition },
    { icon: Palette, label: 'Color', value: activeVehicle?.color },
  ];

  const highlights = [
    activeVehicle?.condition && { label: activeVehicle.condition },
    activeVehicle?.type && { label: activeVehicle.type },
    isShowroom && { label: 'Showroom', icon: Home },
  ].filter(Boolean);

  const next = () => setIdx(current => (photos.length ? (current + 1) % photos.length : 0));
  const prev = () => setIdx(current => (photos.length ? (current - 1 + photos.length) % photos.length : 0));

  const handleShare = async () => {
    setShareMessage('');
    const data = {
      title: listingTitle,
      text: `Check this listing on BikeEka: ${listingTitle}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareMessage('Shared');
        return;
      }

      if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied');
        return;
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      console.error(error);
    }

    setShareMessage('Copy link from the address bar');
  };

  if (!activeVehicle && remoteError) {
    return (
      <main className="vehicle-details-page">
        <div className="vd-container">
          <div className="vd-state-card">
            <h1>Listing not found</h1>
            <p>{remoteError}</p>
            <button type="button" className="vd-back-link" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} aria-hidden="true" />
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!activeVehicle) {
    return (
      <main className="vehicle-details-page">
        <div className="vd-container">
          <div className="vd-loading" aria-label="Loading listing">
            <span />
            <span />
            <span />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vehicle-details-page">
      <div className="vd-container">
        <div className="vd-topbar">
          <button type="button" className="vd-back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} aria-hidden="true" />
            Back to listings
          </button>
        </div>

        <div className="vd-layout">
          <section className="vd-main-column" aria-label="Vehicle photos and details">
            <Gallery
              activePhoto={activePhoto}
              idx={idx}
              listingTitle={listingTitle}
              next={next}
              photos={photos}
              prev={prev}
              setIdx={setIdx}
            />

            <section className="vd-section">
              <div className="vd-section-header">
                <span className="vd-section-icon">
                  <Gauge size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="vd-section-kicker">Details</p>
                  <h2>Vehicle Specifications</h2>
                </div>
              </div>

              <div className="vd-spec-grid">
                {specItems.map(item => (
                  <SpecItem key={item.label} {...item} />
                ))}
                {specItems.length % 2 !== 0 && (
                  <div className="vd-spec-item vd-spec-item--empty" aria-hidden="true" />
                )}
              </div>
            </section>

            <section className="vd-section">
              <div className="vd-section-header">
                <span className="vd-section-icon">
                  <MessageCircle size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="vd-section-kicker">Seller notes</p>
                  <h2>Description</h2>
                </div>
              </div>

              <p className="vd-description">
                {activeVehicle.description || buildDescription(activeVehicle)}
              </p>
            </section>
          </section>

          <aside className="vd-sidebar" aria-label="Listing summary and seller contact">
            <section className="vd-summary-card">
              {highlights.length > 0 && (
                <div className="vd-chip-row" aria-label="Listing highlights">
                  {highlights.map(({ label, icon: Icon }) => (
                    <span className="vd-chip" key={label}>
                      {Icon && <Icon size={14} aria-hidden="true" />}
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="vd-title">{listingTitle}</h1>

              <div className="vd-meta-list">
                <MetaLine icon={MapPin} value={activeVehicle.location || 'Sri Lanka'} />
                {isShowroom && (
                  <MetaLine
                    icon={Home}
                    value={approvedRequest.shopName}
                    verified
                  />
                )}
                <MetaLine icon={Calendar} value={`Posted ${postedDate}`} />
              </div>

              <div className="vd-price-box">
                <span>Price</span>
                <strong>{formatPrice(activeVehicle.price)}</strong>
              </div>

              <div className="vd-hero-facts" aria-label="Quick vehicle facts">
                {heroFacts.map(fact => (
                  <div className="vd-hero-fact" key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>

              <div className="vd-actions">
                {phoneDigits ? (
                  <a className="vd-action vd-action--primary" href={`tel:${phoneDigits}`}>
                    <Phone size={19} aria-hidden="true" />
                    Call Seller
                  </a>
                ) : (
                  <button className="vd-action vd-action--disabled" type="button" disabled>
                    <Phone size={19} aria-hidden="true" />
                    Call unavailable
                  </button>
                )}

                {whatsappNumber && (
                  <a
                    className="vd-action vd-action--whatsapp"
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp aria-hidden="true" />
                    WhatsApp
                  </a>
                )}

                {sellerEmail ? (
                  <a
                    className="vd-action vd-action--secondary"
                    href={`mailto:${sellerEmail}?subject=${emailSubject}&body=${emailBody}`}
                  >
                    <Mail size={18} aria-hidden="true" />
                    Email Seller
                  </a>
                ) : (
                  <button className="vd-action vd-action--secondary" type="button">
                    <MessageCircle size={18} aria-hidden="true" />
                    Chat with Owner
                  </button>
                )}
              </div>
            </section>

            <section 
              className={`vd-seller-card relative overflow-hidden ${isShowroom ? 'vd-seller-card--dark shadow-lg' : ''}`}
              style={{
                backgroundImage: isShowroom && sellerCover ? `url(${sellerCover})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {isShowroom ? (
                <>
                  {/* Glassmorphic blur overlay */}
                  <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] z-0" />
                  
                  <div className="vd-seller-content relative z-10">
                    <div className="vd-seller-profile">
                      <div className="vd-seller-avatar border-2 border-white/20 shadow-md">
                        {sellerAvatar ? (
                          <img src={sellerAvatar} alt={`${sellerName} logo`} />
                        ) : (
                          <span>{getInitials(sellerName)}</span>
                        )}
                      </div>
                      <div className="vd-seller-main">
                        <div className="vd-seller-name text-white">
                          <strong className="text-white">{sellerName}</strong>
                          <VerifiedBadge />
                        </div>
                        <span className="text-emerald-400 font-bold">{sellerTypeLabel}</span>
                      </div>
                    </div>

                    <div className="vd-contact-list vd-contact-list--dark">
                      {sellerPhone && <ContactLine icon={Phone} label="Hotline" value={sellerPhone} href={`tel:${phoneDigits}`} />}
                      {sellerEmail && <ContactLine icon={Mail} label="Email" value={sellerEmail} href={`mailto:${sellerEmail}`} />}
                    </div>

                    <div className="vd-safety-tip vd-safety-tip--dark">
                      <ShieldCheck size={20} className="text-amber-400 shrink-0" aria-hidden="true" />
                      <div>
                        <strong>Safety Tip</strong>
                        <p>Meet in a public place and inspect the vehicle before making any payment.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="vd-seller-content">
                  <div className="vd-seller-profile">
                    <div className="vd-seller-avatar">
                      {sellerAvatar ? (
                        <img src={sellerAvatar} alt={`${sellerName} logo`} />
                      ) : (
                        <span>{getInitials(sellerName)}</span>
                      )}
                    </div>
                    <div className="vd-seller-main">
                      <div className="vd-seller-name">
                        <strong>{sellerName}</strong>
                      </div>
                      <span>{sellerTypeLabel}</span>
                    </div>
                  </div>

                  <div className="vd-contact-list">
                    {sellerPhone && <ContactLine icon={Phone} label="Hotline" value={sellerPhone} href={`tel:${phoneDigits}`} />}
                    {sellerEmail && <ContactLine icon={Mail} label="Email" value={sellerEmail} href={`mailto:${sellerEmail}`} />}
                  </div>

                  <div className="vd-safety-tip">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <div>
                      <strong>Safety Tip</strong>
                      <p>Meet in a public place and inspect the vehicle before making any payment.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="vd-share-card">
              <div className="vd-share-heading">
                <Share2 size={19} aria-hidden="true" />
                <h2>Share this Ad</h2>
              </div>
              <div className="vd-share-actions">
                <button type="button" className="vd-share-button" onClick={handleShare}>
                  <Copy size={17} aria-hidden="true" />
                  Copy Link
                </button>
                <button
                  type="button"
                  className={`vd-share-button ${saved ? 'vd-share-button--saved' : ''}`}
                  onClick={() => setSaved(current => !current)}
                >
                  <Heart size={17} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
                  {saved ? 'Saved' : 'Save Ad'}
                </button>
              </div>
              {shareMessage && <p className="vd-share-status">{shareMessage}</p>}
            </section>
          </aside>
        </div>
      </div>

      {(phoneDigits || whatsappNumber) && (
        <div className="vd-mobile-contact-bar" aria-label="Quick contact actions">
          {phoneDigits && (
            <a className="vd-mobile-action vd-mobile-action--call" href={`tel:${phoneDigits}`}>
              <Phone size={18} aria-hidden="true" />
              Call
            </a>
          )}
          {whatsappNumber && (
            <a
              className="vd-mobile-action vd-mobile-action--whatsapp"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp aria-hidden="true" />
              WhatsApp
            </a>
          )}
        </div>
      )}
    </main>
  );
};

const Gallery = ({ activePhoto, idx, listingTitle, next, photos, prev, setIdx }) => (
  <section className="vd-gallery-card" aria-label="Vehicle gallery">
    <div className="vd-gallery-stage">
      {activePhoto ? (
        <>
          <img className="vd-gallery-backdrop" src={activePhoto} alt="" aria-hidden="true" />
          <img
            className="vd-gallery-image"
            src={activePhoto}
            alt={`${listingTitle} view ${idx + 1}`}
            decoding="async"
          />
        </>
      ) : (
        <div className="vd-gallery-empty">
          <Camera size={34} aria-hidden="true" />
          <span>No images available</span>
        </div>
      )}

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="vd-gallery-nav vd-gallery-nav--prev"
            onClick={prev}
            aria-label="Previous image"
            title="Previous image"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="vd-gallery-nav vd-gallery-nav--next"
            onClick={next}
            aria-label="Next image"
            title="Next image"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </>
      )}

      <div className="vd-photo-count">
        <Camera size={15} aria-hidden="true" />
        {photos.length ? `${idx + 1} / ${photos.length}` : '0 photos'}
      </div>
    </div>

    {photos.length > 1 && (
      <div className="vd-thumb-strip" aria-label="Gallery thumbnails">
        {photos.map((photo, index) => (
          <button
            type="button"
            key={`${photo}-${index}`}
            className={`vd-thumb ${idx === index ? 'is-active' : ''}`}
            onClick={() => setIdx(index)}
            aria-label={`Show photo ${index + 1}`}
            aria-current={idx === index ? 'true' : undefined}
          >
            <img src={photo} alt="" aria-hidden="true" loading="lazy" />
          </button>
        ))}
      </div>
    )}
  </section>
);

const SpecItem = ({ icon: Icon, label, value }) => (
  <div className="vd-spec-item">
    <span className="vd-spec-item__icon">
      {Icon && <Icon size={18} aria-hidden="true" />}
    </span>
    <div className="vd-spec-item__content">
      <span className="vd-spec-item__label">{label}</span>
      <strong className="vd-spec-item__value">{hasValue(value) ? value : 'Not listed'}</strong>
    </div>
  </div>
);

const MetaLine = ({ icon: Icon, value, verified = false }) => (
  <div className="vd-meta-line">
    <Icon size={17} aria-hidden="true" />
    <span>{value}</span>
    {verified && <VerifiedBadge />}
  </div>
);

const VerifiedBadge = () => (
  <img 
    src={verifiedIcon} 
    alt="Verified showroom partner" 
    title="Verified showroom partner" 
    style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }}
  />
);

const ContactLine = ({ icon: Icon, label, value, href }) => {
  const content = (
    <>
      <span className="vd-contact-icon">
        <Icon size={17} aria-hidden="true" />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (href) {
    return (
      <a className="vd-contact-line" href={href}>
        {content}
      </a>
    );
  }

  return <div className="vd-contact-line">{content}</div>;
};

export default VehicleDetails;
