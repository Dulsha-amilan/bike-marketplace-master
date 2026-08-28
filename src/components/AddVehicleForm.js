import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from './vehiclesStore';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import { getStorageUpgradeStatus, requestStorageUpgrade, getMyApprovedMembershipRequest, getAdBanners } from '../api/bikeApi';
import { SkyscraperAdBanner } from './AdBannerComponents';
import verifiedIcon from '../Images/verififedbutton.png';
import VehicleCard from './VehicleCard';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import { 
  Upload, CheckCircle, Image as ImageIcon, MapPin, Phone, 
  Bike, DollarSign, Calendar, Gauge, Fuel, Settings, Layers,
  ChevronLeft, ChevronRight, Check, Trash2, Eye, AlertCircle,
  Camera, ClipboardCheck, ShieldCheck, Users, Timer
} from 'lucide-react';
import BoostPostModal from './BoostPostModal';

const TYPES = [
  { value: 'scooters', label: 'Scooters' },
  { value: 'trail', label: 'Trail' },
  { value: 'sport', label: 'Sport' },
  { value: 'cruiser', label: 'Classic / Cruiser' },
  { value: 'electric', label: 'Electric' },
  { value: 'high-capacity', label: 'High Capacity' },
  { value: 'atv-adv', label: 'ATV / ADV' },
];

const COMMON_BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'KTM', 'Kawasaki', 
  'BMW', 'Ducati', 'Triumph', 'Vespa', 'Aprilia', 'Royal Enfield', 
  'Harley-Davidson', 'Demak', 'Daelim', 'Loncin', 'Lifan'
];

const MAX_UPLOAD_IMAGES = 5;

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

// Helper to auto-generate a clean Ad Title from Make and Model
const generateAutoTitle = (makeStr, modelStr) => {
  const m = (makeStr || '').trim();
  const mod = (modelStr || '').trim();
  if (!m && !mod) return '';
  if (!m) return mod;
  if (!mod) return m;
  // If model already begins with the make name (e.g. "Yamaha R15" with make "Yamaha"), avoid duplication
  if (mod.toLowerCase().startsWith(m.toLowerCase())) {
    return mod;
  }
  return `${m} ${mod}`;
};


function TailwindDatePicker({ value, onChange, placeholder = "Select Model Year", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [decadeStart, setDecadeStart] = useState(Math.floor(currentYear / 10) * 10 - 10);
  
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const yearsInDecade = [];
  for (let y = decadeStart + 11; y >= decadeStart; y--) {
    if (y <= currentYear + 1 && y >= 1980) {
      yearsInDecade.push(y);
    }
  }

  const handlePrevPage = () => {
    if (decadeStart - 12 >= 1970) {
      setDecadeStart(prev => prev - 12);
    }
  };

  const handleNextPage = () => {
    if (decadeStart + 12 <= currentYear + 1) {
      setDecadeStart(prev => prev + 12);
    }
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (!isNaN(d.getTime())) return String(d.getFullYear());
    return String(val);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 md:h-12 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 items-center justify-between hover:bg-muted/10 text-left"
      >
        <span className={value ? "text-foreground font-semibold" : "text-muted-foreground"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-[9999] p-4 w-64 bg-card border border-border/80 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={decadeStart <= 1970}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-border/50 text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm font-bold text-foreground">Select Year</span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={decadeStart + 12 > currentYear + 1}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-border/50 text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {yearsInDecade.map((y) => {
              const selectedYear = value ? (new Date(value).getFullYear() || Number(value)) : null;
              const isSelected = selectedYear === y || String(value) === String(y);

              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    onChange(String(y));
                    setIsOpen(false);
                  }}
                  className={`
                    py-2 px-1 text-xs font-bold rounded-xl transition-all select-none text-center
                    ${isSelected ? 'bg-amber-400 text-black shadow-md shadow-amber-400/25 font-extrabold' : 'bg-muted/40 hover:bg-amber-500/10 hover:text-amber-600 text-foreground'}
                  `}
                >
                  {y}
                </button>
              );
            })}
          </div>

          {value && (
            <div className="mt-3 pt-2.5 border-t border-border/60 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-[10px] text-destructive hover:underline font-bold tracking-wide uppercase"
              >
                Clear Year
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddVehicleForm() {
  const navigate = useNavigate();
  const { addVehicle } = useVehicles();

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
    description: '',
    location: '',
    phone: '',
  };

  const [form, setForm] = useState(initialForm);
  const [uploadHero, setUploadHero] = useState(null);
  const [uploadGallery, setUploadGallery] = useState([]);
  const [heroPreview, setHeroPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [postedVehicle, setPostedVehicle] = useState(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isTitleCustom, setIsTitleCustom] = useState(false);

  // Suggestions state
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const brandRef = useRef(null);

  const { user } = useAuth();
  const [maxUploadImages, setMaxUploadImages] = useState(user?.storageLimit || MAX_UPLOAD_IMAGES);
  const [upgradeStatus, setUpgradeStatus] = useState('none');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showroomDetails, setShowroomDetails] = useState(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Drag & drop state
  const [dragActiveHero, setDragActiveHero] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Toggle for card preview on mobile step 4
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);

  // Skyscraper Ad Banner state
  const [adBanners, setAdBanners] = useState({
    side_skyscraper: {
      slotId: 'side_skyscraper',
      name: 'Side Skyscraper Banner (160x600)',
      dimensions: '160x600',
      title: 'BIKE LEASING & FINANCE',
      subtitle: 'Same day approval with minimum documentation.',
      highlightText: 'RATES FROM 11.5%',
      buttonText: 'APPLY NOW',
      footerText: 'Terms & conditions apply',
      linkUrl: '/showroom-membership',
      imageUrl: '',
      isEnabled: true,
    }
  });

  useEffect(() => {
    let isMounted = true;
    getAdBanners()
      .then(ads => {
        if (isMounted && Array.isArray(ads)) {
          const map = {};
          ads.forEach(ad => {
            map[ad.slotId] = ad;
          });
          setAdBanners(prev => ({ ...prev, ...map }));
        }
      })
      .catch(err => {
        console.warn('Failed to fetch ad banners for AddVehicleForm:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [heroPreview, galleryPreviews]);

  // Fetch upgrade request status
  useEffect(() => {
    if (user) {
      setMaxUploadImages(user.storageLimit || MAX_UPLOAD_IMAGES);
      getStorageUpgradeStatus()
        .then((data) => {
          if (data && data.status) {
            setUpgradeStatus(data.status);
          }
        })
        .catch((err) => console.error("Error fetching upgrade status:", err));
    }
  }, [user]);

  // Fetch approved showroom details if dealer
  useEffect(() => {
    if (user && user.role === 'dealer') {
      getMyApprovedMembershipRequest()
        .then((data) => {
          if (data) {
            setShowroomDetails(data);
            setForm(prev => ({
              ...prev,
              location: prev.location || data.shopName || '',
              phone: prev.phone || data.phone || ''
            }));
          }
        })
        .catch((err) => console.error("Error fetching showroom details:", err));
    }
  }, [user]);

  // Handle click outside suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setShowBrandSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'title') {
      const autoVal = generateAutoTitle(form.make, form.model);
      setIsTitleCustom(value.trim() !== '' && value.trim() !== autoVal.trim());
      setForm((prev) => ({ ...prev, title: value }));
      return;
    }
    if (name === 'model') {
      setForm((prev) => {
        const nextTitle = !isTitleCustom ? generateAutoTitle(prev.make, value) : prev.title;
        return { ...prev, model: value, title: nextTitle };
      });
      return;
    }
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'negotiable' && checked) {
        next.price = '';
      }
      return next;
    });
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMakeChange = (e) => {
    const val = e.target.value;
    setForm(prev => {
      const nextTitle = !isTitleCustom ? generateAutoTitle(val, prev.model) : prev.title;
      return { ...prev, make: val, title: nextTitle };
    });
    
    if (val.trim() === '') {
      setBrandSuggestions(COMMON_BRANDS);
    } else {
      const filtered = COMMON_BRANDS.filter(b => 
        b.toLowerCase().includes(val.toLowerCase())
      );
      setBrandSuggestions(filtered);
    }
    setShowBrandSuggestions(true);
  };

  const handleResetTitleToAuto = () => {
    setIsTitleCustom(false);
    setForm(prev => ({
      ...prev,
      title: generateAutoTitle(prev.make, prev.model)
    }));
  };

  const handleMakeFocus = () => {
    const val = form.make;
    if (val.trim() === '') {
      setBrandSuggestions(COMMON_BRANDS);
    } else {
      const filtered = COMMON_BRANDS.filter(b => 
        b.toLowerCase().includes(val.toLowerCase())
      );
      setBrandSuggestions(filtered);
    }
    setShowBrandSuggestions(true);
  };

  const handleHeroUpload = (e) => {
    const file = (e.target.files && e.target.files[0]) || null;
    handleHeroChange(file);
  };

  const handleHeroChange = (file) => {
    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
    }
    if (file) {
      setUploadHero(file);
      setHeroPreview(URL.createObjectURL(file));
    } else {
      setUploadHero(null);
      setHeroPreview(null);
    }
    setError('');
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    handleGalleryChange(files);
  };

  const handleGalleryChange = (files) => {
    const allowed = maxUploadImages - (uploadHero ? 1 : 0);
    const newFiles = [...uploadGallery, ...files].slice(0, allowed);
    
    // Revoke old previews
    galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    
    setUploadGallery(newFiles);
    setGalleryPreviews(newFiles.map(file => URL.createObjectURL(file)));
    setError('');
  };

  const removeHero = () => {
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setUploadHero(null);
    setHeroPreview(null);
  };

  const removeGalleryImage = (index) => {
    const newGallery = uploadGallery.filter((_, i) => i !== index);
    setUploadGallery(newGallery);
    
    if (galleryPreviews[index]) {
      URL.revokeObjectURL(galleryPreviews[index]);
    }
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryPreviews(newPreviews);
  };

  // Drag & drop handlers
  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === 'hero') setDragActiveHero(true);
      if (type === 'gallery') setDragActiveGallery(true);
    } else if (e.type === "dragleave") {
      if (type === 'hero') setDragActiveHero(false);
      if (type === 'gallery') setDragActiveGallery(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'hero') {
      setDragActiveHero(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleHeroChange(e.dataTransfer.files[0]);
      }
    } else if (type === 'gallery') {
      setDragActiveGallery(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleGalleryChange(Array.from(e.dataTransfer.files));
      }
    }
  };

  // Validations per step
  const isStep1Valid = () => {
    return form.title.trim() !== '' && form.make.trim() !== '' && form.model.trim() !== '' && form.type !== '';
  };

  const isStep2Valid = () => {
    if (form.year === '') return false;
    const yearVal = new Date(form.year).getFullYear();
    const yearValid = !isNaN(yearVal) && yearVal > 1900 && yearVal <= new Date().getFullYear() + 1;
    const descValid = form.description.trim() !== '';
    return yearValid && descValid;
  };

  const isStep3Valid = () => {
    const priceValid = form.negotiable || (form.price !== '' && Number(form.price) > 0);
    const locationValid = form.location.trim() !== '';
    const phoneValid = form.phone.trim().length >= 8;
    return priceValid && locationValid && phoneValid;
  };

  const isStep4Valid = () => {
    const totalSelected = (uploadHero ? 1 : 0) + uploadGallery.length;
    return totalSelected >= 1 && totalSelected <= maxUploadImages;
  };

  const nextStep = () => {
    if (step === 1 && !isStep1Valid()) {
      setAttemptedNext(true);
      return;
    }
    if (step === 2 && !isStep2Valid()) {
      setAttemptedNext(true);
      return;
    }
    if (step === 3 && !isStep3Valid()) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setAttemptedNext(false);
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    // STRICT GUARD: Only submit when on final step (step 4)
    if (step < 4) {
      return;
    }
    if (!isStep4Valid()) {
      setError('Please upload at least 1 image.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('title', form.title);
      fd.append('make', form.make);
      fd.append('model', form.model);
      fd.append('condition', form.condition);
      if (form.year) fd.append('year', String(new Date(form.year).getFullYear()));
      if (form.registerYear) fd.append('registerYear', String(new Date(form.registerYear).getFullYear()));
      if (!form.negotiable && form.price) fd.append('price', String(form.price));
      if (form.mileageKm) fd.append('mileageKm', String(form.mileageKm));
      if (form.engineCapacityCc) fd.append('engineCapacityCc', String(form.engineCapacityCc));
      fd.append('transmission', form.transmission);
      fd.append('fuelType', form.fuelType);
      fd.append('color', form.color);
      fd.append('description', form.description);
      fd.append('location', form.location);
      fd.append('phone', form.phone);

      if (uploadHero) fd.append('hero', uploadHero);
      uploadGallery.forEach((f) => fd.append('gallery', f));

      const created = await addVehicle(fd);
      setPostedVehicle(created);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setHeroPreview(null);
    setGalleryPreviews([]);
    setError('');
    setBusy(false);
    setPostedVehicle(null);
    setStep(1);
    setAttemptedNext(false);
    setIsTitleCustom(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewPostedAd = () => {
    if (postedVehicle?.id) navigate(`/vehicle/${encodeURIComponent(postedVehicle.id)}`);
  };

  const steps = [
    { number: 1, label: 'Identity', desc: 'Bike basics', icon: Bike },
    { number: 2, label: 'Technical Specs', desc: 'Condition and specs', icon: Settings },
    { number: 3, label: 'Pricing & Contact', desc: 'Price and location', icon: Phone },
    { number: 4, label: 'Photos & Review', desc: 'Media and preview', icon: Camera },
  ];

  const currentStep = steps[step - 1];
  const CurrentStepIcon = currentStep.icon;
  const progressPercent = Math.round((step / steps.length) * 100);

  const previewVehicle = useMemo(() => {
    const heroUrl = heroPreview || '';
    const galleryUrls = galleryPreviews || [];

    return {
      id: 'preview',
      title: form.title || 'Honda CBR150R 2022 - Perfect Condition',
      make: form.make || 'Honda',
      model: form.model || 'CBR150R',
      year: form.year ? new Date(form.year).getFullYear() : null,
      registerYear: form.registerYear ? new Date(form.registerYear).getFullYear() : null,
      price: form.negotiable ? null : (form.price ? Number(form.price) : 0),
      location: form.location || 'Colombo, Sri Lanka',
      mileageKm: form.mileageKm ? Number(form.mileageKm) : null,
      engineCapacityCc: form.engineCapacityCc ? Number(form.engineCapacityCc) : null,
      fuelType: form.fuelType || '',
      transmission: form.transmission || '',
      condition: form.condition || 'New',
      type: form.type || 'Standard',
      image: heroUrl,
      gallery: galleryUrls,
      postedAt: new Date().toISOString(),
      user: showroomDetails ? { membershipRequests: [showroomDetails] } : null,
      source: showroomDetails ? 'showroom' : undefined,
    };
  }, [form, heroPreview, galleryPreviews, showroomDetails]);

  const stepGuidance = {
    1: 'Start with the exact bike type, brand, model, and a searchable ad title.',
    2: 'Add real specs and condition notes so buyers can compare faster.',
    3: 'Set the price, location, and phone number buyers should use.',
    4: 'Upload a clean cover photo, review the preview, and publish.'
  };

  const canNavigateToStep = (targetStep) => {
    if (targetStep <= step) return true;
    if (targetStep > 1 && !isStep1Valid()) return false;
    if (targetStep > 2 && !isStep2Valid()) return false;
    if (targetStep > 3 && !isStep3Valid()) return false;
    return true;
  };

  const handleStepSelect = (targetStep) => {
    if (canNavigateToStep(targetStep)) {
      setStep(targetStep);
      setAttemptedNext(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAttemptedNext(true);
    }
  };


  return (
    <main className="min-h-screen bg-slate-50/80 py-6 md:py-10 px-2 sm:px-4">
      <div className="post-ad-page-layout">
        {/* Left Skyscraper Ad (Desktop Only) */}
        <aside className="post-ad-side-ad post-ad-side-ad--left" aria-label="Left Advertisement Banner">
          <div className="post-ad-sticky-ad">
            <SkyscraperAdBanner ad={adBanners['side_skyscraper']} />
          </div>
        </aside>

        {/* Main Post Ad Form Content */}
        <div className="post-ad-main-content">
          <div className="w-full pb-12">
        {!postedVehicle ? (
          <>
            {/* Seller hero and guidance */}
            <div className="mb-5 md:mb-7 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
              <section className="rounded-lg border border-border/70 bg-card p-5 shadow-sm md:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase text-amber-700">
                     Marketplace Seller
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-[46px]">
                        Sell Your Bike
                      </h1>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                        Post an ad in minutes and connect with thousands of local buyers. This guided form helps you create a clear, buyer-ready listing before it goes live.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-slate-50 p-2 text-center md:min-w-[310px]">
                    <div className="rounded-md bg-card px-2 py-3">
                      <Timer className="mx-auto mb-1.5 h-4 w-4 text-amber-600" />
                      <p className="text-[11px] font-bold text-foreground">Fast post</p>
                      <p className="text-[10px] text-muted-foreground">4 steps</p>
                    </div>
                    <div className="rounded-md bg-card px-2 py-3">
                      <Users className="mx-auto mb-1.5 h-4 w-4 text-emerald-600" />
                      <p className="text-[11px] font-bold text-foreground">Local reach</p>
                      <p className="text-[10px] text-muted-foreground">Buyer ready</p>
                    </div>
                    <div className="rounded-md bg-card px-2 py-3">
                      <ShieldCheck className="mx-auto mb-1.5 h-4 w-4 text-sky-600" />
                      <p className="text-[11px] font-bold text-foreground">Clear info</p>
                      <p className="text-[10px] text-muted-foreground">Fewer repeats</p>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-lg border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-amber-300">Draft Progress</p>
                    <h2 className="mt-1 text-xl font-extrabold">{currentStep.label}</h2>
                  </div>
                  <div className="rounded-md bg-white/10 px-3 py-2 text-sm font-extrabold">
                    {progressPercent}%
                  </div>
                </div>

                <div className="mt-5 h-2 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-200">
                  <div className="flex gap-2">
                    <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <p>{stepGuidance[step]}</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p>Required fields are marked, and each step checks your ad before moving forward.</p>
                  </div>
                </div>
              </aside>
            </div>

            <div className="space-y-6 md:space-y-8">

            {/* Responsive Stepper Container */}
            <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border/60 bg-slate-50/80 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <CurrentStepIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Create listing</p>
                    <h2 className="text-base font-extrabold text-foreground md:text-lg">
                      Step {step} of {steps.length}: {currentStep.label}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <p className="text-xs font-semibold text-muted-foreground md:text-right">{currentStep.desc}</p>
                  <span className="shrink-0 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                    {progressPercent}% complete
                  </span>
                </div>
              </div>

              <div className="h-1.5 bg-muted">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-4 md:gap-3 md:p-4">
                {steps.map((s) => {
                  const isActive = s.number === step;
                  const isCompleted = s.number < step;
                  const StepIcon = s.icon;
                  const statusText = isCompleted ? 'Completed' : isActive ? 'Current step' : 'Upcoming';

                  return (
                    <button
                      key={s.number}
                      type="button"
                      className={`group flex min-h-[92px] items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        isActive
                          ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300'
                            : 'border-border bg-card hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                      onClick={() => handleStepSelect(s.number)}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isActive
                              ? 'border-amber-400 bg-amber-400 text-slate-950'
                              : 'border-border bg-muted text-muted-foreground group-hover:border-amber-300 group-hover:bg-amber-50 group-hover:text-amber-700'
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : <StepIcon className="h-5 w-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              isActive
                                ? 'bg-white/10 text-amber-200'
                                : isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>
                        <p className={`truncate text-sm font-extrabold ${isActive ? 'text-white' : 'text-foreground'}`}>
                          {s.label}
                        </p>
                        <p className={`mt-0.5 line-clamp-1 text-xs ${isActive ? 'text-slate-300' : 'text-muted-foreground'}`}>
                          {s.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Form Content area */}
          <form onSubmit={onSubmit} id="vehicle-form" className="space-y-6">
            
            {/* Showroom Dealer Banner */}
            {user?.role === 'dealer' && showroomDetails && (
              <div className="bg-[#F8FAFC] border border-[#0B1530]/20 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center gap-4">
                  {showroomDetails.shopImage ? (
                    <img 
                      src={showroomDetails.shopImage} 
                      alt="Shop Logo" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0B1530] flex items-center justify-center text-[#FFC700] shadow-sm">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-black text-[#0B1530] uppercase tracking-wide flex items-center gap-1.5">
                      Showroom Dealer Mode Active
                      <img 
                        src={verifiedIcon} 
                        alt="Verified Showroom Partner" 
                        className="w-4 h-4 object-contain flex-shrink-0"
                        title="Verified Showroom Partner"
                      />
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Dealership: <span className="text-slate-800 font-bold">{showroomDetails.shopName}</span> • Plan: {showroomDetails.membership?.planName}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Verified Dealer
                </div>
              </div>
            )}
            
            {/* Step 1: General Details */}
            {step === 1 && (
              <Card className="overflow-visible rounded-lg border-border/70 shadow-sm relative z-10">
                <CardHeader className="border-b border-border/60 bg-card pb-4 md:pb-5 rounded-t-lg">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <Bike className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Bike Identity</CardTitle>
                        <CardDescription className="text-sm">Start with the details buyers search for first.</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                      <ClipboardCheck className="h-4 w-4" />
                      Required first step
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      {/* Category select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          Bike Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={form.type} onValueChange={(val) => handleSelectChange('type', val)}>
                          <SelectTrigger className="h-11 md:h-12 rounded-lg focus:ring-amber-500/20 focus:border-amber-400 text-sm">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Condition select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          Condition <span className="text-destructive">*</span>
                        </Label>
                        <Select value={form.condition} onValueChange={(val) => handleSelectChange('condition', val)}>
                          <SelectTrigger className="h-11 md:h-12 rounded-lg focus:ring-amber-500/20 focus:border-amber-400 text-sm">
                            <SelectValue placeholder="Select Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Used">Used (Second Hand)</SelectItem>
                            <SelectItem value="New">Brand New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Make input */}
                      <div className="space-y-2 relative z-30" ref={brandRef}>
                        <Label htmlFor="make" className="text-sm font-semibold flex items-center gap-1.5">
                          Make (Brand) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="make"
                          name="make"
                          value={form.make}
                          onChange={handleMakeChange}
                          onFocus={handleMakeFocus}
                          autoComplete="off"
                          placeholder="e.g. Honda, Yamaha, Bajaj"
                          className={`h-11 md:h-12 rounded-lg focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.make.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                        />

                        {showBrandSuggestions && brandSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 z-[9999] max-h-56 overflow-y-auto rounded-lg border border-border bg-card shadow-xl animate-in fade-in duration-100">
                            {brandSuggestions.map((brand) => (
                              <button
                                key={brand}
                                type="button"
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors font-medium text-foreground"
                                onClick={() => {
                                  setForm(prev => {
                                    const nextTitle = !isTitleCustom ? generateAutoTitle(brand, prev.model) : prev.title;
                                    return { ...prev, make: brand, title: nextTitle };
                                  });
                                  setShowBrandSuggestions(false);
                                }}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        )}

                        {attemptedNext && form.make.trim() === '' && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Make is required
                          </p>
                        )}
                      </div>

                      {/* Model input */}
                      <div className="space-y-2">
                        <Label htmlFor="model" className="text-sm font-semibold flex items-center gap-1.5">
                          Model Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="model"
                          name="model"
                          value={form.model}
                          onChange={handleChange}
                          placeholder="e.g. CBR150R, Hornet, Pulsar"
                          className={`h-11 md:h-12 rounded-lg focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.model.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                        />
                        {attemptedNext && form.model.trim() === '' && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Model is required
                          </p>
                        )}
                      </div>

                      {/* Ad Title */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-1.5">
                            Ad Title <span className="text-destructive">*</span>
                          </Label>
                          {isTitleCustom && (form.make || form.model) && (
                            <button
                              type="button"
                              onClick={handleResetTitleToAuto}
                              className="text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline flex items-center gap-1 transition-colors"
                              title="Auto-fill title from Brand and Model"
                            >
                              ↺ Reset to Auto Title ({generateAutoTitle(form.make, form.model)})
                            </button>
                          )}
                        </div>
                        <Input
                          id="title"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          maxLength={100}
                          placeholder="e.g. Honda CBR150R 2022 - Mint Condition"
                          className={`h-11 md:h-12 rounded-lg text-sm focus:ring-amber-500/20 focus:border-amber-400 ${attemptedNext && form.title.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-muted-foreground gap-1 px-1">
                          <span>
                            {!isTitleCustom && (form.make || form.model)
                              ? "✨ Auto-filled from Brand & Model. You can freely edit or customize it anytime."
                              : "Use the brand, model, year, and best selling point."}
                          </span>
                          <span className={`font-semibold ${form.title.length >= 100 ? 'text-red-500' : (form.title.length > 80 ? 'text-amber-500' : 'text-muted-foreground')}`}>
                            {form.title.length}/100 characters
                          </span>
                        </div>
                        {attemptedNext && form.title.trim() === '' && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Title is required
                          </p>
                        )}
                      </div>
                    </div>

                    <aside className="rounded-lg border border-border/70 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                        <Eye className="h-4 w-4 text-amber-600" />
                        Buyers notice first
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <div className="flex gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>Exact brand and model help your ad appear in relevant searches.</span>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>A specific title gives buyers confidence before they open the listing.</span>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>Condition sets expectations early and reduces unnecessary calls.</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Technical Specifications */}
            {step === 2 && (
              <Card className="border-border/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardHeader className="border-b border-border/40 pb-4 md:pb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl">Specifications</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Enter technical specification parameters of the bike.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-5 md:pt-6">
                  
                  {/* Model Year */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" /> Model Year <span className="text-destructive">*</span>
                    </Label>
                    <TailwindDatePicker
                      value={form.year}
                      onChange={(val) => handleSelectChange('year', val)}
                      placeholder="Select Model Year"
                      className={attemptedNext && !isStep2Valid() ? 'border border-destructive rounded-xl bg-destructive/5' : ''}
                    />
                    {attemptedNext && !isStep2Valid() && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Model Year must be between 1900 and {new Date().getFullYear() + 1}
                      </p>
                    )}
                  </div>

                  {/* Register Year */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" /> Registration Year
                    </Label>
                    <TailwindDatePicker
                      value={form.registerYear}
                      onChange={(val) => handleSelectChange('registerYear', val)}
                      placeholder="Select Registration Year"
                    />
                  </div>

                  {/* Mileage */}
                  <div className="space-y-2">
                    <Label htmlFor="mileageKm" className="text-sm font-semibold flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-muted-foreground" /> Mileage (km)
                    </Label>
                    <Input 
                      type="number" 
                      id="mileageKm" 
                      name="mileageKm" 
                      value={form.mileageKm} 
                      onChange={handleChange} 
                      placeholder="e.g. 4500" 
                      className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Engine CC */}
                  <div className="space-y-2">
                    <Label htmlFor="engineCapacityCc" className="text-sm font-semibold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-muted-foreground" /> Engine Capacity (cc)
                    </Label>
                    <Input 
                      type="number" 
                      id="engineCapacityCc" 
                      name="engineCapacityCc" 
                      value={form.engineCapacityCc} 
                      onChange={handleChange} 
                      placeholder="e.g. 150" 
                      className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <Label htmlFor="transmission" className="text-sm font-semibold flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-muted-foreground" /> Transmission
                    </Label>
                    <Input 
                      id="transmission" 
                      name="transmission" 
                      value={form.transmission} 
                      onChange={handleChange} 
                      placeholder="e.g. Manual, Automatic" 
                      className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Fuel className="w-4 h-4 text-muted-foreground" /> Fuel Type
                    </Label>
                    <Select value={form.fuelType} onValueChange={(val) => handleSelectChange('fuelType', val)}>
                      <SelectTrigger className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm">
                        <SelectValue placeholder="Select Fuel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-semibold flex items-center gap-1.5">
                      Body Color
                    </Label>
                    <Input 
                      id="color" 
                      name="color" 
                      value={form.color} 
                      onChange={handleChange} 
                      placeholder="e.g. Red, Matte Black, White" 
                      className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                    />
                  </div>

                  {/* Description text area */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-1.5">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      maxLength={3000}
                      rows={5}
                      placeholder="Describe your bike's condition, modifications, history..."
                      className={`flex min-h-[120px] w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder:text-muted-foreground ${attemptedNext && form.description.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                      <span>Provide details like maintenance, modifications, or issues.</span>
                      <span className={`font-semibold ${form.description.length >= 3000 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {form.description.length}/3000 characters
                      </span>
                    </div>
                    {attemptedNext && form.description.trim() === '' && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Description is required
                      </p>
                    )}
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Step 3: Pricing & Location */}
            {step === 3 && (
              <Card className="border-border/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardHeader className="border-b border-border/40 pb-4 md:pb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl">Pricing & Location</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Configure listing price and local contact preferences.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-5 md:pt-6">
                  
                  {/* Pricing field */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 md:gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-muted-foreground" /> Price (Rs) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          id="price"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          placeholder={form.negotiable ? "Negotiable" : "e.g. 2,250,000"}
                          disabled={form.negotiable}
                          className={`h-11 md:h-12 rounded-xl text-lg font-bold focus:ring-amber-500/20 focus:border-amber-400 ${attemptedNext && !form.negotiable && (form.price === '' || Number(form.price) <= 0) ? 'border-destructive bg-destructive/5' : ''}`}
                        />
                      </div>
                      
                      {/* Custom styled negotiable checkbox/toggle */}
                      <div className="flex items-center h-11 md:h-12 pt-0 sm:pt-1">
                        <label className={`
                          flex items-center justify-center space-x-3 cursor-pointer p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/40 transition-all select-none w-full sm:w-auto h-full
                          ${form.negotiable ? 'border-amber-400 bg-amber-50/20 text-amber-900 font-semibold' : ''}
                        `}>
                          <input
                            type="checkbox"
                            name="negotiable"
                            checked={form.negotiable}
                            onChange={handleChange}
                            className="w-5 h-5 accent-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium">Price is Negotiable</span>
                        </label>
                      </div>
                    </div>
                    {attemptedNext && !form.negotiable && (form.price === '' || Number(form.price) <= 0) && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Please specify a valid price or mark it as Negotiable.
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> Location (District) <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.location}
                      onValueChange={(val) => handleSelectChange('location', val)}
                    >
                      <SelectTrigger 
                        id="location"
                        className={`h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.location.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                      >
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {SRI_LANKA_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {attemptedNext && form.location.trim() === '' && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Location is required
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      placeholder="e.g. 077 123 4567" 
                      required 
                      className={`h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.phone.trim().length < 8 ? 'border-destructive bg-destructive/5' : ''}`}
                    />
                    {attemptedNext && form.phone.trim().length < 8 && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Please specify a valid contact number (min 8 digits)
                      </p>
                    )}
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Step 4: Photos & Submit (Mobile Friendly Segmented View) */}
            {step === 4 && (
              <div className="space-y-6">
                
                {/* Mobile View Toggle Segment (Tab style) */}
                <div className="flex lg:hidden bg-muted/65 p-1 rounded-xl border border-border/40 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setShowPreviewOnMobile(false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${!showPreviewOnMobile ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Photo Uploads
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewOnMobile(true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${showPreviewOnMobile ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Ad Card Preview
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Upload Card - visible on desktop OR on mobile if preview is off */}
                  <div className={`lg:col-span-7 space-y-6 ${showPreviewOnMobile ? 'hidden lg:block' : 'block'}`}>
                    <Card className="border-border/60 shadow-md rounded-2xl">
                      <CardHeader className="border-b border-border/40 pb-4 md:pb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg md:text-xl">Upload Photos</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Tap below to choose files from your device.</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-5 md:pt-6">
                        
                        {/* Cover Photo Area */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-1 text-primary">
                            Cover Photo <span className="text-destructive">*</span>
                          </Label>
                          
                          {heroPreview ? (
                            <div className="relative group border border-border/60 rounded-2xl overflow-hidden h-44 md:h-48 bg-muted/20 shadow-inner">
                              <img 
                                src={heroPreview} 
                                alt="Cover Preview" 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={removeHero}
                                  className="p-3 bg-destructive rounded-full text-white hover:bg-destructive/90 hover:scale-110 transition-all shadow-md"
                                  title="Remove Cover Photo"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Cover Photo Selected
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`
                                relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all cursor-pointer select-none active:scale-[0.98]
                                ${dragActiveHero ? 'border-amber-400 bg-amber-500/5 scale-[0.99]' : 'border-muted-foreground/30 hover:bg-muted/30 hover:border-amber-400/50'}
                                ${attemptedNext && !uploadHero ? 'border-destructive bg-destructive/5' : ''}
                              `}
                              onDragEnter={(e) => handleDrag(e, 'hero')}
                              onDragOver={(e) => handleDrag(e, 'hero')}
                              onDragLeave={(e) => handleDrag(e, 'hero')}
                              onDrop={(e) => handleDrop(e, 'hero')}
                            >
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleHeroUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                              />
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-11 h-11 bg-muted/60 rounded-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-xs md:text-sm font-semibold text-primary block">Tap to upload cover photo</span>
                                  <span className="text-[10px] md:text-xs text-muted-foreground block">or drag and drop cover image here</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {attemptedNext && !uploadHero && (
                            <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" /> Cover photo is required.
                            </p>
                          )}
                        </div>

                        {/* Gallery Uploads Area */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <Label className="text-sm font-semibold text-primary">Gallery Images</Label>
                            <span className="text-xs text-muted-foreground font-semibold">
                              {uploadGallery.length}/{maxUploadImages - (uploadHero ? 1 : 0)} files
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                            {galleryPreviews.map((url, idx) => (
                              <div key={idx} className="relative group border border-border/50 rounded-xl overflow-hidden aspect-[4/3] bg-muted/20 shadow-sm">
                                <img 
                                  src={url} 
                                  alt={`Gallery item ${idx}`} 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeGalleryImage(idx)}
                                    className="p-2.5 bg-destructive rounded-full text-white hover:bg-destructive/90 hover:scale-110 transition-all shadow"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {uploadGallery.length < (maxUploadImages - (uploadHero ? 1 : 0)) && (
                              <div 
                                className={`
                                  relative border-2 border-dashed rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-3 text-center cursor-pointer select-none transition-all active:scale-[0.97]
                                  ${dragActiveGallery ? 'border-amber-400 bg-amber-500/5' : 'border-muted-foreground/30 hover:bg-muted/40 hover:border-amber-400/50'}
                                `}
                                onDragEnter={(e) => handleDrag(e, 'gallery')}
                                onDragOver={(e) => handleDrag(e, 'gallery')}
                                onDragLeave={(e) => handleDrag(e, 'gallery')}
                                onDrop={(e) => handleDrop(e, 'gallery')}
                              >
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  multiple 
                                  onChange={handleGalleryUpload} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                />
                                <Upload className="w-4.5 h-4.5 text-muted-foreground mb-1" />
                                <span className="text-[10px] md:text-[11px] font-bold text-primary block">Add Gallery Photos</span>
                                <span className="text-[9px] text-muted-foreground block mt-0.5">Tap to select</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upgrade Request Banner */}
                        {maxUploadImages < 10 && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">Need to upload more photos?</h4>
                              <p className="text-xs text-muted-foreground">Request a free upgrade to upload up to 10 images for your listing.</p>
                            </div>
                            
                            {upgradeStatus === 'none' && (
                              <Button
                                type="button"
                                size="sm"
                                disabled={upgradeLoading}
                                onClick={async () => {
                                  setUpgradeLoading(true);
                                  try {
                                    await requestStorageUpgrade();
                                    setUpgradeStatus('pending');
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setUpgradeLoading(false);
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg shrink-0"
                              >
                                {upgradeLoading ? 'Requesting...' : 'Request 10 Images'}
                              </Button>
                            )}
                            
                            {upgradeStatus === 'pending' && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                Pending Admin Approval
                              </span>
                            )}
                            
                            {upgradeStatus === 'rejected' && (
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                  Upgrade Rejected
                                </span>
                                <button
                                  type="button"
                                  disabled={upgradeLoading}
                                  onClick={async () => {
                                    setUpgradeLoading(true);
                                    try {
                                      await requestStorageUpgrade();
                                      setUpgradeStatus('pending');
                                    } catch (err) {
                                      console.error(err);
                                    } finally {
                                      setUpgradeLoading(false);
                                    }
                                  }}
                                  className="text-[10px] text-amber-500 hover:underline font-bold"
                                >
                                  Request Again
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {error && (
                          <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-start gap-2 border border-destructive/20 animate-pulse">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right side: Real-time Live Preview - visible on desktop OR on mobile if preview tab is active */}
                  <div className={`lg:col-span-5 space-y-4 lg:sticky lg:top-24 lg:self-start ${!showPreviewOnMobile ? 'hidden lg:block' : 'block'}`}>
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-amber-500" /> Ad Card Preview
                      </Label>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide animate-pulse">Draft Preview</span>
                    </div>
                    
                    <VehicleCard vehicle={previewVehicle} isPreview />
                  </div>

                </div>
              </div>
            )}

            {/* Step Controls (Footer Buttons) */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 md:h-12 px-5 md:px-6 rounded-xl gap-2 font-semibold transition-all hover:bg-muted/40 shadow-sm text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-11 md:h-12 px-6 rounded-xl gap-1.5 font-bold bg-primary hover:bg-primary/95 text-white active:scale-98 transition-all shadow-md text-sm ml-auto"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={busy}
                  className="h-11 md:h-12 px-6 rounded-xl gap-1.5 font-bold bg-amber-500 hover:bg-amber-600 text-black active:scale-98 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-sm ml-auto"
                >
                  {busy ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Publishing...
                    </div>
                  ) : (
                    <>
                      Publish Ad Now <CheckCircle className="w-4.5 h-4.5 text-black" />
                    </>
                  )}
                </Button>
              )}
            </div>

          </form>
        </div>
      </>
    ) : (
        /* Professional Marketplace Success view */
        <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-xl text-center space-y-7">
            
            {/* Success Badge */}
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200/80 flex items-center justify-center shadow-sm">
              <CheckCircle className="w-9 h-9 md:w-11 md:h-11 stroke-[2.2]" />
            </div>

            {/* Title & Headline */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Ad Live & Active
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Listing Published Successfully
              </h2>
              <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                Your vehicle ad has been created and is now live for buyers across Sri Lanka.
              </p>
            </div>

            {/* Listing Preview Snapshot Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left flex flex-col sm:flex-row items-center gap-4">
              {(postedVehicle?.image || heroPreview) ? (
                <img
                  src={resolveMediaUrl(postedVehicle?.image || heroPreview)}
                  alt={form.title || 'Vehicle'}
                  className="w-full sm:w-32 h-24 object-cover rounded-lg border border-slate-200/80 shadow-sm shrink-0 bg-white"
                />
              ) : (
                <div className="w-full sm:w-32 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                  <Bike className="w-8 h-8" />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1 w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {[form.make, form.model].filter(Boolean).join(' ') || 'Scooter'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  {postedVehicle?.title || form.title || 'Vehicle Listing'}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  {form.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {form.location}
                    </span>
                  )}
                  {form.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {form.year}
                    </span>
                  )}
                </div>

                <div className="pt-0.5 text-sm font-black text-slate-900">
                  {form.negotiable ? (
                    <span className="text-slate-500 font-bold">Negotiable</span>
                  ) : form.price ? (
                    <span className="text-slate-900 font-black">
                      Rs: {Number(form.price).toLocaleString('en-LK')}
                    </span>
                  ) : (
                    'Negotiable'
                  )}
                </div>
              </div>
            </div>

            {/* Primary Action Buttons styled in BikeEka theme */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-1">
              <Button
                onClick={viewPostedAd}
                className="flex-1 h-12 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm border border-amber-500/30"
              >
                <Eye className="w-4 h-4 text-slate-950" />
                View Listing Ad
              </Button>

              <Button
                variant="outline"
                onClick={resetForAnother}
                className="flex-1 h-12 border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm bg-white"
              >
                <Bike className="w-4 h-4 text-amber-500" />
                Post Another Bike
              </Button>
            </div>

            {/* Footer Home link */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Return to Marketplace Home
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Boost Post Modal Component */}
      <BoostPostModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        vehicle={postedVehicle || {
          id: 'temp',
          title: form.title || 'Vehicle Listing',
          image: heroPreview,
          price: form.price,
          location: form.location
        }}
      />
          </div>
        </div>

        {/* Right Skyscraper Ad (Desktop Only) */}
        <aside className="post-ad-side-ad post-ad-side-ad--right" aria-label="Right Advertisement Banner">
          <div className="post-ad-sticky-ad">
            <SkyscraperAdBanner ad={adBanners['side_skyscraper']} />
          </div>
        </aside>
      </div>
    </main>
  );
}
