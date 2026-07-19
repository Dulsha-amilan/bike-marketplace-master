import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../api/bikeApi';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import {
  FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight,
  FiPhone, FiHeart, FiActivity, FiSettings, FiTag, FiDroplet,
  FiAward, FiTruck, FiShare2, FiMessageCircle, FiArrowLeft
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaInstagram } from 'react-icons/fa6';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import './VehicleDetails.css';

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
  const [remoteVehicle, setRemoteVehicle] = useState(null);
  const [remoteError, setRemoteError] = useState('');

  // Scroll to top and reset gallery index when visiting/changing vehicle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIdx(0);
  }, [id]);

  const vehicle = useMemo(
    () => allVehicles.find(v => v.id === id),
    [allVehicles, id]
  );

  useEffect(() => {
    let alive = true;
    setRemoteError('');

    if (!vehicle && id) {
      getVehicleById(id)
        .then((v) => {
          if (!alive) return;
          setRemoteVehicle(v);
        })
        .catch((e) => {
          if (!alive) return;
          console.error(e);
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
    const arr = (activeVehicle.gallery && activeVehicle.gallery.length) ? activeVehicle.gallery : [activeVehicle.image];
    return arr.filter(Boolean).map(resolveMediaUrl);
  }, [activeVehicle]);

  const next = () => setIdx(i => (photos.length ? (i + 1) % photos.length : 0));
  const prev = () => setIdx(i => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
  const whats = useMemo(() => (activeVehicle ? whatsappPhoneFromLK(activeVehicle.phone ?? '0714029197') : ''), [activeVehicle]);

  if (!activeVehicle && remoteError) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Listing not found</h2>
        <p className="text-muted-foreground mb-6">{remoteError}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <FiArrowLeft className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (!activeVehicle) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20 pt-8 md:pt-14">
      {/* Breadcrumb / Back Navigation - Floating or Fixed top if needed, but here just standard */}
      <div className="container mx-auto px-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent transition-colors"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" /> Back to listings
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Gallery & Details */}
          <div className="lg:col-span-8 space-y-8">

            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-lg group">
                {photos.length > 0 ? (
                  <img
                    src={photos[idx]}
                    alt={`${activeVehicle.title} - View ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No images available</div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <FiChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      {idx + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {photos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={p} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Overview / Specs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FiActivity className="text-primary" /> Vehicle Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Spec Items */}
                  <SpecItem icon={FiAward} label="Make" value={activeVehicle.make} />
                  <SpecItem icon={FiTruck} label="Model" value={activeVehicle.model} />
                  <SpecItem icon={FiCalendar} label="Year" value={activeVehicle.year} />
                  <SpecItem icon={FiActivity} label="Mileage" value={activeVehicle.mileageKm ? `${activeVehicle.mileageKm.toLocaleString()} km` : null} />
                  <SpecItem icon={FiSettings} label="Engine" value={activeVehicle.engineCapacityCc ? `${activeVehicle.engineCapacityCc} cc` : null} />
                  <SpecItem icon={FiSettings} label="Transmission" value={activeVehicle.transmission} />
                  <SpecItem icon={FiDroplet} label="Fuel Type" value={activeVehicle.fuelType} />
                  <SpecItem icon={FiTag} label="Condition" value={activeVehicle.condition} />
                  <SpecItem icon={FiTag} label="Color" value={activeVehicle.color} />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                {activeVehicle.description ? (
                  <p>{activeVehicle.description}</p>
                ) : (
                  <p>
                    Check out this {activeVehicle.condition || 'used'} {activeVehicle.make} {activeVehicle.model} from {activeVehicle.year}.
                    It is currently located in {activeVehicle.location}.
                    {activeVehicle.mileageKm ? ` This vehicle has done approximately ${activeVehicle.mileageKm.toLocaleString()} km.` : ''}
                    For more details or to arrange a viewing, please contact the seller using the options provided.
                  </p>
                )}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Info & Actions */}
          <div className="lg:col-span-4 space-y-6">

            {/* Main Info Card */}
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{activeVehicle.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FiMapPin className="text-primary" />
                    {activeVehicle.location}
                    <span className="mx-1">•</span>
                    <span>{toISODate(activeVehicle.postedAt)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Price</div>
                  <div className="text-4xl font-bold text-primary">{formatPrice(activeVehicle.price)}</div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <a href={`tel:${onlyDigits(activeVehicle.phone || '0714029197')}`} className="w-full">
                    <Button className="w-full text-lg h-12 gap-2 shadow-sm" size="lg">
                      <FiPhone /> Call Seller
                    </Button>
                  </a>

                  {whats && (
                    <a
                      href={`https://wa.me/${whats}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full h-12 gap-2 border-green-500 text-green-600 hover:bg-green-50">
                        <FaWhatsapp size={20} /> WhatsApp
                      </Button>
                    </a>
                  )}

                  <Button variant="secondary" className="w-full h-12 gap-2">
                    <FiMessageCircle /> Chat with Owner
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info / Safety */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
                    <FiTruck />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Verified Seller</div>
                    <div className="text-xs text-muted-foreground">Member since 2024</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <strong className="text-yellow-800 block mb-1">Safety Tip</strong>
                  Always meet in a public place. Do not make payments before inspecting the vehicle.
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiShare2 /> Share this Ad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-between">
                  <Button variant="outline" size="icon" className="rounded-full hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200">
                    <FaFacebookF />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full hover:text-black hover:bg-gray-50 hover:border-gray-400">
                    <FaXTwitter />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full hover:text-pink-600 hover:bg-pink-50 hover:border-pink-200">
                    <FaInstagram />
                  </Button>
                  <Button variant="outline" className="flex-grow gap-2">
                    <FiHeart /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </main>
  );
};

const SpecItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex flex-col p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="font-medium text-gray-900 truncate">
        {value || '—'}
      </div>
    </div>
  );
};

export default VehicleDetails;