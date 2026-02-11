import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from './vehiclesStore';
import {
  downloadMergedSampleVehiclesJS,
  downloadSingleVehicleJS,
  downloadUserVehiclesJS,
  downloadVehicleObjectSnippet,
} from '../utils/exportVehicles';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from './ui/card';
import { 
  Upload, CheckCircle, Image as ImageIcon, MapPin, Phone, 
  Bike, DollarSign, Calendar, Gauge, Fuel, Settings, Layers 
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

  // Helper for Select changes
  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const downloadLastAsJs = () => { if (postedVehicle) downloadSingleVehicleJS(postedVehicle); };
  const downloadObjectSnippet = () => { if (postedVehicle) downloadVehicleObjectSnippet(postedVehicle); };
  const downloadUserAdsJs = () => { downloadUserVehiclesJS(userVehicles); };
  const downloadMergedJs = () => { downloadMergedSampleVehiclesJS(allVehicles); };

  return (
    <main className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
          Sell Your Bike
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create a listing in minutes and reach thousands of interested buyers.
        </p>
      </div>

      {!postedVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <form id="vehicle-form" onSubmit={onSubmit}>
              
              {/* Section: Basic Info */}
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Bike className="w-5 h-5" /> Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Ad Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g., Honda CBR150R 2022 - Mint Condition"
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Catchy titles attract more clicks.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.type} onValueChange={(val) => handleSelectChange('type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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

                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={form.condition} onValueChange={(val) => handleSelectChange('condition', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" name="make" value={form.make} onChange={handleChange} placeholder="Honda" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" name="model" value={form.model} onChange={handleChange} placeholder="CBR150R" required />
                  </div>
                </CardContent>
              </Card>

              {/* Section: Specification */}
              <Card className="mt-6 border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Settings className="w-5 h-5" /> Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground"/> Model Year</Label>
                    <Input type="number" id="year" name="year" value={form.year} onChange={handleChange} placeholder="2022" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerYear" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground"/> Register Year</Label>
                    <Input type="number" id="registerYear" name="registerYear" value={form.registerYear} onChange={handleChange} placeholder="2022" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileageKm" className="flex items-center gap-2"><Gauge className="w-4 h-4 text-muted-foreground"/> Mileage (km)</Label>
                    <Input type="number" id="mileageKm" name="mileageKm" value={form.mileageKm} onChange={handleChange} placeholder="4500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineCapacityCc" className="flex items-center gap-2"><Layers className="w-4 h-4 text-muted-foreground"/> Engine (cc)</Label>
                    <Input type="number" id="engineCapacityCc" name="engineCapacityCc" value={form.engineCapacityCc} onChange={handleChange} placeholder="149" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission" className="flex items-center gap-2"><Settings className="w-4 h-4 text-muted-foreground"/> Transmission</Label>
                    <Input id="transmission" name="transmission" value={form.transmission} onChange={handleChange} placeholder="Manual" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType" className="flex items-center gap-2"><Fuel className="w-4 h-4 text-muted-foreground"/> Fuel Type</Label>
                    <Input id="fuelType" name="fuelType" value={form.fuelType} onChange={handleChange} placeholder="Petrol" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" value={form.color} onChange={handleChange} placeholder="Red" />
                  </div>
                </CardContent>
              </Card>

              {/* Section: Pricing & Location */}
              <Card className="mt-6 border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <MapPin className="w-5 h-5" /> Price & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                     <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="price" className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground"/> Price (Rs)</Label>
                          <Input
                            type="number"
                            id="price"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="2,250,000"
                            disabled={form.negotiable}
                            className="text-lg font-semibold"
                          />
                        </div>
                        <div className="flex items-center h-10 pb-1">
                          <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <input
                              type="checkbox"
                              name="negotiable"
                              checked={form.negotiable}
                              onChange={handleChange}
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium">Negotiable</span>
                          </label>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/> Location</Label>
                    <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="Colombo" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/> Phone Number</Label>
                    <Input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="077 123 4567" required />
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar: Images & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-muted/30 border-dashed border-2 shadow-none lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5" /> Photos
                </CardTitle>
                <CardDescription>
                  Upload clear photos to sell faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {/* Hero Image */}
                <div className="space-y-3">
                  <Label className="block text-sm font-medium mb-1">Cover Photo</Label>
                  <div 
                    className={`
                      relative group border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                      ${uploadHero ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50'}
                    `}
                  >
                    <input type="file" accept="image/*" onChange={handleHeroUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                      {uploadHero ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-primary mb-1" />
                          <span className="text-sm font-medium text-primary break-all line-clamp-1">{uploadHero.name}</span>
                          <span className="text-xs text-muted-foreground">Click to change</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Click to upload</span>
                          <span className="text-xs text-muted-foreground">or drag and drop</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="block text-sm font-medium">Gallery</Label>
                    <span className="text-xs text-muted-foreground">{uploadGallery.length}/{MAX_UPLOAD_IMAGES}</span>
                  </div>
                  
                  <div 
                    className={`
                      relative group border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                      ${uploadGallery.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50'}
                    `}
                  >
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                       <Layers className={`w-8 h-8 ${uploadGallery.length > 0 ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
                       {uploadGallery.length > 0 ? (
                         <span className="text-sm font-medium text-primary">{uploadGallery.length} files selected</span>
                       ) : (
                         <span className="text-sm font-medium">Add more photos</span>
                       )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                 <Button form="vehicle-form" type="submit" size="lg" disabled={busy} className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all">
                  {busy ? 'Posting...' : 'Post Ad Now'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto border-green-200 bg-green-50 shadow-lg text-center py-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-green-800">Ad Posted!</h2>
              <p className="text-green-700">Your vehicle "{postedVehicle.title || postedVehicle.id}" is now live.</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button onClick={viewPostedAd} className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all px-8">View Ad</Button>
              <Button variant="outline" onClick={resetForAnother} className="bg-white border-green-200 hover:bg-green-100 text-green-700">Post Another</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}