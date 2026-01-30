// src/components/AddVehicleForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from './vehiclesStore';
import {
  downloadMergedSampleVehiclesJS,
  downloadSingleVehicleJS,
  downloadUserVehiclesJS,
  downloadVehicleObjectSnippet,
} from '../utils/exportVehicles';
import './AddVehicleForm.css';


const TYPES = [
  { value: 'scooters', label: 'Scooters' },
  { value: 'trail', label: 'Trail' },
  { value: 'sport', label: 'Sport' },
  { value: 'cruiser', label: 'Classic / Cruiser' },
  { value: 'electric', label: 'Electric' },
  { value: 'high-capacity', label: 'High Capacity' },
  { value: 'atv-adv', label: 'ATV / ADV' },
];

const MAX_UPLOAD_IMAGES = 4;

export default function AddVehicleForm() {
  const navigate = useNavigate();
  const { addVehicle, userVehicles, allVehicles } = useVehicles();

  const initialForm = {
    type: 'scooters',
    title: '',
    make: '',
    model: '',
    condition: 'Used',
    year: '',
    registerYear: '',
    price: '',
    negotiable: false,
    mileageKm: '',
    engineCapacityCc: '',
    transmission: '',
    fuelType: '',
    color: '',
    location: '',
    phone: '',
  };

  const [form, setForm] = useState(initialForm);
  const [uploadHero, setUploadHero] = useState(null);
  const [uploadGallery, setUploadGallery] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [postedVehicle, setPostedVehicle] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'negotiable' && checked) {
        next.price = '';
      }
      return next;
    });
  };

  const handleHeroUpload = async (e) => {
    const file = (e.target.files && e.target.files[0]) || null;
    setUploadHero(file);
    setError('');
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    setUploadGallery(files);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const totalSelected = (uploadHero ? 1 : 0) + (uploadGallery?.length || 0);
      if (totalSelected < 1) {
        throw new Error('Please upload at least 1 image.');
      }
      if (totalSelected > MAX_UPLOAD_IMAGES) {
        throw new Error(`Please upload maximum ${MAX_UPLOAD_IMAGES} images.`);
      }

      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('title', form.title);
      fd.append('make', form.make);
      fd.append('model', form.model);
      fd.append('condition', form.condition);
      if (form.year) fd.append('year', String(form.year));
      if (form.registerYear) fd.append('registerYear', String(form.registerYear));
      if (!form.negotiable && form.price) fd.append('price', String(form.price));
      if (form.mileageKm) fd.append('mileageKm', String(form.mileageKm));
      if (form.engineCapacityCc) fd.append('engineCapacityCc', String(form.engineCapacityCc));
      fd.append('transmission', form.transmission);
      fd.append('fuelType', form.fuelType);
      fd.append('color', form.color);
      fd.append('location', form.location);
      fd.append('phone', form.phone);

      if (uploadHero) fd.append('hero', uploadHero);
      (uploadGallery || []).forEach((f) => fd.append('gallery', f));

      const created = await addVehicle(fd);
      setPostedVehicle(created);
      // Go straight to the listing details page after posting
      if (created?.id) navigate(`/vehicle/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetForAnother = () => {
    setForm(initialForm);
    setUploadHero(null);
    setUploadGallery([]);
    setError('');
    setBusy(false);
    setPostedVehicle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewPostedAd = () => {
    if (postedVehicle?.id) navigate(`/vehicle/${encodeURIComponent(postedVehicle.id)}`);
  };

  // Export handlers
  const downloadLastAsJs = () => {
    if (postedVehicle) downloadSingleVehicleJS(postedVehicle);
  };
  const downloadObjectSnippet = () => {
    if (postedVehicle) downloadVehicleObjectSnippet(postedVehicle);
  };
  const downloadUserAdsJs = () => {
    downloadUserVehiclesJS(userVehicles);
  };
  const downloadMergedJs = () => {
    downloadMergedSampleVehiclesJS(allVehicles);
  };

  return (
    <main className="container add-vehicle-page">
      <h1>Post Your Vehicle</h1>

      {!postedVehicle ? (
        <form className="vehicle-form" onSubmit={onSubmit}>
          <div className="grid">
            <label>
              <span>Category</span>
              <select name="type" value={form.type} onChange={handleChange} required>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Honda CBR150R 2022 - Showroom Condition"
              />
            </label>

            <label>
              <span>Make</span>
              <input name="make" value={form.make} onChange={handleChange} placeholder="Honda" required />
            </label>

            <label>
              <span>Model</span>
              <input name="model" value={form.model} onChange={handleChange} placeholder="CBR150R" required />
            </label>

            <label>
              <span>Condition</span>
              <select name="condition" value={form.condition} onChange={handleChange}>
                <option>Used</option>
                <option>New</option>
              </select>
            </label>

            <label>
              <span>Model Year</span>
              <input type="number" name="year" value={form.year} onChange={handleChange} placeholder="2022" required />
            </label>

            <label>
              <span>Register Year</span>
              <input type="number" name="registerYear" value={form.registerYear} onChange={handleChange} placeholder="2022" />
            </label>

            <label>
              <span>Price (Rs)</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g., 2250000"
                disabled={form.negotiable}
              />
            </label>

            <label className="checkbox-inline">
              <input type="checkbox" name="negotiable" checked={form.negotiable} onChange={handleChange} />
              <span>Negotiable</span>
            </label>

            <label>
              <span>Mileage (km)</span>
              <input type="number" name="mileageKm" value={form.mileageKm} onChange={handleChange} placeholder="4500" />
            </label>

            <label>
              <span>Engine Capacity (cc)</span>
              <input
                type="number"
                name="engineCapacityCc"
                value={form.engineCapacityCc}
                onChange={handleChange}
                placeholder="149"
              />
            </label>

            <label>
              <span>Transmission</span>
              <input name="transmission" value={form.transmission} onChange={handleChange} placeholder="Manual / Automatic / CVT" />
            </label>

            <label>
              <span>Fuel Type</span>
              <input name="fuelType" value={form.fuelType} onChange={handleChange} placeholder="Petrol / Electric / Hybrid" />
            </label>

            <label>
              <span>Color</span>
              <input name="color" value={form.color} onChange={handleChange} placeholder="Red" />
            </label>

            <label>
              <span>Location</span>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Colombo" required />
            </label>

            <label>
              <span>Phone</span>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="071 800 1234" required />
            </label>

            <label className="full">
              <span>Upload Images (Required)</span>
              <div className="uploads" style={{ padding: 0 }}>
                <div>
                  <label>
                    <span>Hero Image</span>
                    <input type="file" accept="image/*" onChange={handleHeroUpload} />
                  </label>
                  {uploadHero && <div className="hint">Hero image selected ✓</div>}
                </div>
                <div>
                  <label>
                    <span>Gallery Images (max {MAX_UPLOAD_IMAGES} total)</span>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
                  </label>
                  {uploadGallery.length > 0 && <div className="hint">{uploadGallery.length} gallery image(s) selected ✓</div>}
                </div>
                <p className="tiny-note">
                  Upload between 1 and {MAX_UPLOAD_IMAGES} images.
                </p>
              </div>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Posting…' : 'Post Ad'}
            </button>
          </div>
        </form>
      ) : (
        <div className="vehicle-form">
          <div className="success-card">
            <h2>Ad posted successfully 🎉</h2>
            <p>Your ad "{postedVehicle.title || postedVehicle.id}" is saved to the server.</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={viewPostedAd}>
                View Posted Ad
              </button>
              <button className="btn" onClick={downloadLastAsJs}>
                Download This Ad (.js module)
              </button>
              <button className="btn" onClick={downloadObjectSnippet}>
                Download Object Snippet (.js)
              </button>
              <button className="btn" onClick={downloadUserAdsJs}>
                Download My Ads (.js)
              </button>
              <button className="btn" onClick={downloadMergedJs}>
                Download sampleVehicles.js (merged)
              </button>
              <button className="btn" onClick={resetForAnother}>
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}