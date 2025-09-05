// src/components/VehicleDetails.jsx
// or src/pages/VehicleDetails.jsx (keep your import path in App.js consistent)
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  // IMPORTANT: hooks must be called before any conditional return
  const [idx, setIdx] = useState(0);

  const vehicle = useMemo(() => allVehicles.find(v => v.id === id), [allVehicles, id]);

  if (!vehicle) {
    return (
      <main className="vehicle-details">
        <div className="container">
          <p>Listing not found.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </main>
    );
  }

  const {
    title,
    image,
    gallery = [],
    price,
    postedAt,
    location,
    mileageKm,
    make,
    model,
    year,
    registerYear,
    engineCapacityCc,
    transmission,
    condition,
    fuelType,
    color,
    phone = '0714029197',
    type
  } = vehicle;

  const photos = gallery.length ? gallery : [image];
  const next = () => setIdx(i => (i + 1) % photos.length);
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);

  const whats = whatsappPhoneFromLK(phone);

  return (
    <main className="vehicle-details">
      <div className="container">
        <div className="vd-top">
          <button className="link back" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <h1 className="vd-title">{title}</h1>

        <div className="vd-meta">
          {make && <span className="make-pill">{make}</span>}
          <span className="meta-item">
            <FiCalendar aria-hidden="true" /> {toISODate(postedAt)}
          </span>
          <span className="meta-item">
            <FiMapPin aria-hidden="true" /> {location}
          </span>
          <span className="meta-item">
            <FiEye aria-hidden="true" /> 113 views
          </span>
        </div>

        <div className="vd-grid">
          {/* Left: Gallery + info */}
          <section className="vd-left">
            <div className="gallery">
              <button className="nav prev" onClick={prev} aria-label="Previous photo">
                <FiChevronLeft />
              </button>
              <img src={photos[idx]} alt={`${title} - ${idx + 1}`} className="hero-photo" />
              <button className="nav next" onClick={next} aria-label="Next photo">
                <FiChevronRight />
              </button>
              <div className="counter">{idx + 1}/{photos.length}</div>
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
                    <span className="value">{mileageKm != null ? `${mileageKm.toLocaleString()} km` : '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Engine Capacity</span>
                    <span className="value">{engineCapacityCc != null ? `${engineCapacityCc} cc` : '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Transmission</span>
                    <span className="value">{transmission || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Manufacturer</span>
                    <span className="value">{make || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Model Year</span>
                    <span className="value">{year || '—'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="row">
                    <span className="label">Condition</span>
                    <span className="value">{condition || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Model</span>
                    <span className="value">{model || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Fuel Type</span>
                    <span className="value">{fuelType || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Colour</span>
                    <span className="value">{color || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="label">Vehicle Type</span>
                    <span className="value">{type || '—'}</span>
                  </div>
                </div>
              </div>
            </section>
          </section>

          {/* Right: Sidebar */}
          <aside className="vd-right">
            <div className="price-card">
              <div className="price">{formatPrice(price)}</div>
              <div className="mini-info">
                <div className="mini-row">
                  <span>Mileage</span>
                  <strong>{mileageKm != null ? `${mileageKm.toLocaleString()} km` : '—'}</strong>
                </div>
                <div className="mini-row">
                  <span>Model</span>
                  <strong>{model || '—'}</strong>
                </div>
                <div className="mini-row">
                  <span>Model Year</span>
                  <strong>{year || '—'}</strong>
                </div>
                <div className="mini-row">
                  <span>Register Year</span>
                  <strong>{registerYear || year || '—'}</strong>
                </div>
              </div>
            </div>

            <div className="contact-card">
              <a href={`tel:${onlyDigits(phone)}`} className="phone">
                <FiPhone /> {phone}
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
      </div>
    </main>
  );
};

export default VehicleDetails;