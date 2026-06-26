import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from './vehiclesStore';
import { Button } from './ui/button';
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
import { 
  Upload, CheckCircle, Image as ImageIcon, MapPin, Phone, 
  Bike, DollarSign, Calendar, Gauge, Fuel, Settings, Layers,
  ChevronLeft, ChevronRight, Sparkles, Check, Trash2, Eye, AlertCircle
} from 'lucide-react';

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function TailwindDatePicker({ value, onChange, placeholder = "Select date", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth());
  
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

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const maxYear = new Date().getFullYear() + 1;
  const years = [];
  for (let y = maxYear; y >= 1980; y--) {
    years.push(y);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const blanks = Array(startDayOfWeek).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...blanks, ...days];

  const selectedDay = value ? new Date(value).getDate() : null;
  const isSameMonthAndYear = value && 
    new Date(value).getMonth() === currentMonth && 
    new Date(value).getFullYear() === currentYear;

  const today = new Date();
  const isToday = (day) => {
    return today.getDate() === day && 
      today.getMonth() === currentMonth && 
      today.getFullYear() === currentYear;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 md:h-12 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 items-center justify-between hover:bg-muted/10 text-left"
      >
        <span className={value ? "text-primary font-medium" : "text-muted-foreground"}>
          {value ? formatSelectedDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 p-4 w-72 bg-card border border-border/80 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-border/50 text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1.5 items-center">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-amber-500"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i} className="text-primary bg-card">{name}</option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-amber-500"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="text-primary bg-card">{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-border/50 text-muted-foreground hover:text-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="w-8 h-8" />;
              }

              const isSelected = isSameMonthAndYear && selectedDay === day;
              const currentIsToday = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`
                    w-8 h-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all select-none
                    ${isSelected ? 'bg-amber-400 text-black shadow-md shadow-amber-400/25 font-extrabold hover:bg-amber-400' : ''}
                    ${!isSelected && currentIsToday ? 'border border-amber-400 text-amber-500 font-bold' : ''}
                    ${!isSelected && !currentIsToday ? 'hover:bg-muted/70 text-primary' : ''}
                  `}
                >
                  {day}
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
                Clear Date
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

  // Wizard state
  const [step, setStep] = useState(1);
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Drag & drop state
  const [dragActiveHero, setDragActiveHero] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Toggle for card preview on mobile step 4
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [heroPreview, galleryPreviews]);

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

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
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
    const allowed = MAX_UPLOAD_IMAGES - (uploadHero ? 1 : 0);
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
    return !isNaN(yearVal) && yearVal > 1900 && yearVal <= new Date().getFullYear() + 1;
  };

  const isStep3Valid = () => {
    const priceValid = form.negotiable || (form.price !== '' && Number(form.price) > 0);
    const locationValid = form.location.trim() !== '';
    const phoneValid = form.phone.trim().length >= 8;
    return priceValid && locationValid && phoneValid;
  };

  const isStep4Valid = () => {
    const totalSelected = (uploadHero ? 1 : 0) + uploadGallery.length;
    return totalSelected >= 1 && totalSelected <= MAX_UPLOAD_IMAGES;
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
    e.preventDefault();
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
      fd.append('location', form.location);
      fd.append('phone', form.phone);

      if (uploadHero) fd.append('hero', uploadHero);
      uploadGallery.forEach((f) => fd.append('gallery', f));

      const created = await addVehicle(fd);
      setPostedVehicle(created);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewPostedAd = () => {
    if (postedVehicle?.id) navigate(`/vehicle/${encodeURIComponent(postedVehicle.id)}`);
  };

  const steps = [
    { number: 1, label: 'Identity', desc: 'Bike details' },
    { number: 2, label: 'Technical Specs', desc: 'Specifications' },
    { number: 3, label: 'Pricing & Contact', desc: 'Listing terms' },
    { number: 4, label: 'Photos & Review', desc: 'Media & Review' },
  ];

  return (
    <main className="container mx-auto py-6 md:py-12 px-4 max-w-5xl pb-12">
      {/* Title & Subtitle */}
      <div className="mb-6 md:mb-10 text-center space-y-2 md:space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" /> Marketplace Seller
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Sell Your Bike
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">
          Post an ad in minutes and connect with thousands of local buyers.
        </p>
      </div>

      {!postedVehicle ? (
        <div className="space-y-6 md:space-y-8">
          
          {/* Responsive Stepper Container */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 md:p-6 shadow-sm">
            
            {/* Desktop-only Stepper */}
            <div className="hidden md:flex relative justify-between items-center w-full z-10">
              <div className="absolute top-[22px] left-[5%] right-[5%] h-0.5 bg-muted/60 z-0">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 animate-pulse"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((s) => {
                const isActive = s.number === step;
                const isCompleted = s.number < step;
                return (
                  <div 
                    key={s.number} 
                    className="flex flex-col items-center text-center relative z-10 cursor-pointer group"
                    onClick={() => {
                      if (s.number < step) {
                        setStep(s.number);
                        setAttemptedNext(false);
                      } else if (s.number > step) {
                        let canGo = true;
                        if (step === 1 && !isStep1Valid()) canGo = false;
                        if (step === 2 && !isStep2Valid() && s.number > 2) canGo = false;
                        if (step === 3 && !isStep3Valid() && s.number > 3) canGo = false;
                        if (canGo) {
                          setStep(s.number);
                          setAttemptedNext(false);
                        } else {
                          setAttemptedNext(true);
                        }
                      }
                    }}
                  >
                    <div 
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                        ${isCompleted ? 'bg-green-500 text-white border-2 border-green-500' : ''}
                        ${isActive ? 'bg-primary text-primary-foreground border-4 border-amber-400 scale-110 shadow-md ring-4 ring-amber-400/20' : ''}
                        ${!isActive && !isCompleted ? 'bg-muted/70 text-muted-foreground border-2 border-border/80 group-hover:bg-muted group-hover:text-foreground' : ''}
                      `}
                    >
                      {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.number}
                    </div>
                    <div className="mt-2">
                      <p className={`text-sm font-semibold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 max-w-[120px] mx-auto mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile-only Stepper */}
            <div className="flex md:hidden flex-col items-center w-full space-y-2.5">
              <div className="flex justify-between items-center w-full text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Step {step} of 4</span>
                <span className="text-amber-500 font-extrabold">{steps[step - 1].label}</span>
              </div>
              
              <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between w-full text-[10px] text-muted-foreground/90 font-medium pt-0.5">
                <span>{step < 4 ? `Next: ${steps[step].label}` : 'Final Submission'}</span>
                <span>{Math.round((step / steps.length) * 100)}% Complete</span>
              </div>
            </div>

          </div>

          {/* Form Content area */}
          <form onSubmit={onSubmit} id="vehicle-form" className="space-y-6">
            
            {/* Step 1: General Details */}
            {step === 1 && (
              <Card className="border-border/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardHeader className="border-b border-border/40 pb-4 md:pb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl">Bike Details</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Tell us about the bike model and key details.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-5 md:pt-6">
                  
                  {/* Category select */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={form.type} onValueChange={(val) => handleSelectChange('type', val)}>
                      <SelectTrigger className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm">
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
                      <SelectTrigger className="h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm">
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Used">Used (Second Hand)</SelectItem>
                        <SelectItem value="New">Brand New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Make input */}
                  <div className="space-y-2">
                    <Label htmlFor="make" className="text-sm font-semibold flex items-center gap-1.5">
                      Make (Brand) <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="make" 
                      name="make" 
                      value={form.make} 
                      onChange={handleChange} 
                      placeholder="e.g. Honda, Yamaha, Bajaj" 
                      className={`h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.make.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                    />
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
                      className={`h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.model.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                    />
                    {attemptedNext && form.model.trim() === '' && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Model is required
                      </p>
                    )}
                  </div>

                  {/* Ad Title */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-1.5">
                      Ad Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g. Honda CBR150R 2022 - Mint Condition"
                      className={`h-11 md:h-12 rounded-xl text-sm focus:ring-amber-500/20 focus:border-amber-400 ${attemptedNext && form.title.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                    />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-muted-foreground gap-1 px-1">
                      <span>Catchy titles with condition details attract 3x more clicks.</span>
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
                      <MapPin className="w-4 h-4 text-muted-foreground" /> Location (City) <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="location" 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange} 
                      placeholder="e.g. Colombo, Kandy, Gampaha" 
                      required 
                      className={`h-11 md:h-12 rounded-xl focus:ring-amber-500/20 focus:border-amber-400 text-sm ${attemptedNext && form.location.trim() === '' ? 'border-destructive bg-destructive/5' : ''}`}
                    />
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
                              {uploadGallery.length}/{MAX_UPLOAD_IMAGES - (uploadHero ? 1 : 0)} files
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

                            {uploadGallery.length < (MAX_UPLOAD_IMAGES - (uploadHero ? 1 : 0)) && (
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
                  <div className={`lg:col-span-5 space-y-4 ${!showPreviewOnMobile ? 'hidden lg:block' : 'block'}`}>
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-amber-500" /> Ad Card Preview
                      </Label>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide animate-pulse">Draft Preview</span>
                    </div>
                    
                    {/* Styled Mock listing card */}
                    <div className="border border-border/60 rounded-2xl bg-card overflow-hidden shadow-md transition-shadow hover:shadow-lg flex flex-col h-full max-w-sm mx-auto w-full">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted/40 flex items-center justify-center">
                        {heroPreview ? (
                          <img
                            src={heroPreview}
                            alt={form.title || 'Bike Preview'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/60 p-6 text-center">
                            <Bike className="w-12 h-12 stroke-[1.2] text-muted-foreground/30 animate-bounce" />
                            <span className="text-xs font-medium">No Cover Photo Selected</span>
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.7 rounded-md shadow-sm uppercase tracking-wide">
                            {form.condition}
                          </span>
                        </div>
                        
                        {galleryPreviews.length > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse"></span>
                            {galleryPreviews.length + (uploadHero ? 1 : 0)} photos
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex-grow flex flex-col gap-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-foreground line-clamp-1 leading-tight">
                            {form.title || 'e.g. Honda CBR150R 2022 - Perfect Condition'}
                          </h3>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="truncate">{form.location || 'Colombo, Sri Lanka'}</span>
                          </div>
                        </div>
                        
                        <div className="text-xl font-extrabold text-primary mt-1">
                          {form.negotiable ? 'Negotiable' : `Rs: ${form.price ? Number(form.price).toLocaleString('en-LK') : '0'}`}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-muted-foreground mt-auto pt-4 border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{form.year ? new Date(form.year).getFullYear() : 'Year'}</span>
                          </div>
                          {form.mileageKm && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 flex items-center justify-center font-bold">K</span>
                              <span>{Number(form.mileageKm).toLocaleString()} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <Button disabled className="w-full font-semibold rounded-xl bg-muted/60 text-muted-foreground border border-border/40 pointer-events-none" size="lg">
                          View Details
                        </Button>
                      </div>
                    </div>
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
                  form="vehicle-form"
                  type="submit"
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
      ) : (
        /* Celebratory Success view with confetti styling */
        <Card className="max-w-2xl mx-auto border-2 border-emerald-500/30 bg-emerald-500/5 shadow-2xl text-center py-12 px-6 rounded-2xl relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>

          <CardContent className="space-y-6 relative z-10">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-md">
              <CheckCircle className="h-10 w-10 md:h-12 md:w-12 stroke-[2.2]" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Congratulation! Ad Live</h2>
              <p className="text-sm md:text-md text-muted-foreground max-w-md mx-auto">
                Your listing for "<span className="text-primary font-bold">{postedVehicle.title || postedVehicle.id}</span>" has been created successfully.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 max-w-sm mx-auto">
              <Button 
                onClick={viewPostedAd} 
                className="flex-1 h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md hover:shadow-lg rounded-xl transition-all"
              >
                View Listing Ad
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForAnother} 
                className="flex-1 h-12 border-border/80 hover:bg-muted/40 font-semibold rounded-xl transition-all bg-card"
              >
                Post Another Bike
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}