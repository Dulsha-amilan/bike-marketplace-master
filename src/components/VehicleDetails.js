import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiCalendar, FiEye, FiChevronLeft, FiChevronRight,
  FiPhone, FiHeart
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaInstagram } from 'react-icons/fa6';

const formatPrice = price => (price == null ? 'Negotiable' : `Rs: ${price.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`);
const toISODate = d => new Date(d).toISOString().slice(0, 10);
const onlyDigits = s => (s || '').replace(/\D/g, '');
const whatsappPhoneFromLK = phone => {
  const d = onlyDigits(phone);
  if (!d) return '';
  return d.startsWith('0') ? `94${d.slice(1)}` : (d.startsWith('94') ? d : `94${d}`);
};

const VehicleDetails = ({ allVehicles }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);

  // Scroll to top and reset gallery index when visiting/changing vehicle (Safari-safe)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIdx(0);
  }, [id]);

  const vehicle = useMemo(
    () => allVehicles.find(v => v.id === id),
    [allVehicles, id]
  );

  const photos = useMemo(() => {
    if (!vehicle) return [];
    const arr = (vehicle.gallery && vehicle.gallery.length) ? vehicle.gallery : [vehicle.image];
    return arr.filter(Boolean);
  }, [vehicle]);

  const next = () => setIdx(i => (photos.length ? (i + 1) % photos.length : 0));
  const prev = () => setIdx(i => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
  const whats = useMemo(() => (vehicle ? whatsappPhoneFromLK(vehicle.phone ?? '0714029197') : ''), [vehicle]);

  return (
    <main className="vehicle-details">
      <div className="container">
        {!vehicle ? (
          <>
            <div className="vd-top">
              <button className="link back" onClick={() => navigate(-1)}>← Back</button>
            </div>
            <h1 className="vd-title">Listing not found</h1>
            <p>Please go back and try another vehicle.</p>
          </>
        ) : (
          <>
            <div className="vd-top">
              <button className="link back" onClick={() => navigate(-1)}>← Back</button>
            </div>

            <h1 className="vd-title">{vehicle.title}</h1>

            <div className="vd-meta">
              {vehicle.make && <span className="make-pill">{vehicle.make}</span>}
              <span className="meta-item">
                <FiCalendar aria-hidden="true" /> {toISODate(vehicle.postedAt)}
              </span>
              <span className="meta-item">
                <FiMapPin aria-hidden="true" /> {vehicle.location}
              </span>
              <span className="meta-item">
                <FiEye aria-hidden="true" /> 113 views
              </span>
            </div>

            <div className="vd-grid">
              <section className="vd-left">
                <div className="gallery">
                  <button className="nav prev" onClick={prev} aria-label="Previous photo">
                    <FiChevronLeft />
                  </button>
                  {photos.length > 0 && (
                    <img
                      src={photos[idx]}
                      alt={`${vehicle.title} - ${idx + 1}`}
                      className="hero-photo"
                    />
                  )}
                  <button className="nav next" onClick={next} aria-label="Next photo">
                    <FiChevronRight />
                  </button>
                  {photos.length > 0 && (
                    <div className="counter">{idx + 1}/{photos.length}</div>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="thumbs">
                    {photos.map((p, i) => (
                      <button
                        key={p + i}
                        className={`thumb ${i === idx ? 'active' : ''}`}
                        onClick={() => setIdx(i)}
                        aria-label={`Photo ${i + 1}`}
                      >
                        <img src={p} alt={`thumb ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}

                <section className="core-info">
                  <h3 className="section-title">Core Information</h3>
                  <div className="info-cards">
                    <div className="info-card">
                      <div className="row">
                        <span className="label">Mileage</span>
                        <span className="value">
                          {vehicle.mileageKm != null ? `${vehicle.mileageKm.toLocaleString()} km` : '—'}
                        </span>
                      </div>
                      <div className="row">
                        <span className="label">Engine Capacity</span>
                        <span className="value">
                          {vehicle.engineCapacityCc != null ? `${vehicle.engineCapacityCc} cc` : '—'}
                        </span>
                      </div>
                      <div className="row">
                        <span className="label">Transmission</span>
                        <span className="value">{vehicle.transmission || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Manufacturer</span>
                        <span className="value">{vehicle.make || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Model Year</span>
                        <span className="value">{vehicle.year || '—'}</span>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="row">
                        <span className="label">Condition</span>
                        <span className="value">{vehicle.condition || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Model</span>
                        <span className="value">{vehicle.model || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Fuel Type</span>
                        <span className="value">{vehicle.fuelType || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Colour</span>
                        <span className="value">{vehicle.color || '—'}</span>
                      </div>
                      <div className="row">
                        <span className="label">Vehicle Type</span>
                        <span className="value">{vehicle.type || '—'}</span>
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              <aside className="vd-right">
                <div className="price-card">
                  <div className="price">{formatPrice(vehicle.price)}</div>
                  <div className="mini-info">
                    <div className="mini-row">
                      <span>Mileage</span>
                      <strong>{vehicle.mileageKm != null ? `${vehicle.mileageKm.toLocaleString()} km` : '—'}</strong>
                    </div>
                    <div className="mini-row">
                      <span>Model</span>
                      <strong>{vehicle.model || '—'}</strong>
                    </div>
                    <div className="mini-row">
                      <span>Model Year</span>
                      <strong>{vehicle.year || '—'}</strong>
                    </div>
                    <div className="mini-row">
                      <span>Register Year</span>
                      <strong>{vehicle.registerYear || vehicle.year || '—'}</strong>
                    </div>
                  </div>
                </div>

                <div className="contact-card">
                  <a href={`tel:${onlyDigits(vehicle.phone || '0714029197')}`} className="phone">
                    <FiPhone /> {vehicle.phone || '0714029197'}
                  </a>
                  <div className="actions">
                    {whats && (
                      <a
                        className="btn btn-whatsapp"
                        href={`https://wa.me/${whats}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp /> Chat on WhatsApp
                      </a>
                    )}
                    <a className="btn btn-outline" href="#" onClick={e => e.preventDefault()}>
                      Chat with Owner
                    </a>
                  </div>
                </div>

                <div className="share-card">
                  <div className="share-title">Share this ad</div>
                  <div className="share-row">
                    <a className="icon-share" href="#" onClick={e => e.preventDefault()} aria-label="Share to Facebook">
                      <FaFacebookF />
                    </a>
                    <a className="icon-share" href="#" onClick={e => e.preventDefault()} aria-label="Share to X">
                      <FaXTwitter />
                    </a>
                    <a className="icon-share" href="#" onClick={e => e.preventDefault()} aria-label="Share to Instagram">
                      <FaInstagram />
                    </a>
                  </div>
                  <button className="btn btn-save" type="button">
                    <FiHeart /> Save
                  </button>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default VehicleDetails;