// App.js - Frontend-only posting via localStorage (VehiclesProvider) + AddVehicleForm route
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import SellerPathwayModal from './components/SellerPathwayModal';


import Header from './components/Header';
import QuickFilters from './components/QuickFilters';
import FeaturedListings from './components/FeaturedListings';
import SpareParts from './components/SpareParts';
import BikerGear from './components/BikerGear';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

import './styles/globals.css';
import './App.css';

import CategoryList from './components/CategoryList';
import VehicleDetails from './components/VehicleDetails';
import ScrollToTop from './components/ScrollToTop';

// NEW: vehicles store + form
import { VehiclesProvider, useVehicles } from './components/vehiclesStore';
import AddVehicleForm from './components/AddVehicleForm';
import Hero from './components/Hero';
import GlobalSearchResults from './components/GlobalSearchResults';
import ShowroomMembershipsPage from './components/ShowroomMembershipsPage';
import {
  filtersToQueryString,
  hasActiveSearchFilters,
  parseFiltersFromSearchParams,
} from './utils/vehicleSearchParams';

// Auth
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';

// Small wrappers to inject allVehicles from context
function CategoryListRoute() {
  const { allVehicles } = useVehicles();
  return <CategoryList allVehicles={allVehicles} />;
}
function VehicleDetailsRoute() {
  const { allVehicles } = useVehicles();
  return <VehicleDetails allVehicles={allVehicles} />;
}

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid #e5e7eb',
          borderTopColor: '#FFD600',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin Protected route — redirects to /admin-login if not authenticated or not admin
function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid #e5e7eb',
          borderTopColor: '#FFD600',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

function AppContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [showPathwayModal, setShowPathwayModal] = useState(false);
  const [language, setLanguage] = useState('english');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchFilters, setSearchFilters] = useState(() =>
    parseFiltersFromSearchParams(searchParams)
  );
  const [showSearchResults, setShowSearchResults] = useState(() =>
    hasActiveSearchFilters(parseFiltersFromSearchParams(searchParams))
  );

  useEffect(() => {
    const fromUrl = parseFiltersFromSearchParams(searchParams);
    setSearchFilters(fromUrl);
    setShowSearchResults(hasActiveSearchFilters(fromUrl));
  }, [searchParams]);

  const handleGlobalSearch = useCallback(
    (filters) => {
      if (!hasActiveSearchFilters(filters)) {
        return;
      }
      const query = filtersToQueryString(filters);
      setSearchParams(query ? new URLSearchParams(query) : {}, { replace: false });
      setShowSearchResults(hasActiveSearchFilters(filters));
      window.requestAnimationFrame(() => {
        const el = document.getElementById('global-search-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    [setSearchParams]
  );

  const handleClearGlobalSearch = useCallback(() => {
    setSearchParams({}, { replace: false });
    setSearchFilters({
      brand: '',
      model: '',
      priceRange: '',
      location: '',
    });
    setShowSearchResults(false);
  }, [setSearchParams]);

  const handlePostAdClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/post-ad');
      } else {
        setShowPathwayModal(true);
      }
    } else {
      navigate('/post-ad');
    }
  };

  const translations = {
    english: {
      home: "Home",
      spareParts: "Spare Parts",
      bikerGear: "Biker Gear",
      bikerGearTitle: "Biker Gear & Helmets",
      bikerGearSubtitle: "Safety gear and accessories for every rider",
      helmets: "Helmets",
      gloves: "Gloves",
      jackets: "Jackets",
      boots: "Boots",
      rainGear: "Rain Gear",
      reflectiveVests: "Reflective Vests",
      helmetTypes: "Helmet Types",
      fullFace: "Full Face",
      halfFace: "Half Face",
      modular: "Modular",
      size: "Size",
      allSizes: "All Sizes",
      priceRange: "Price Range",
      allPrices: "All Prices",
      verifiedSeller: "Verified Seller Only",
      verified: "Verified",
      availableGear: "Available Gear",
      featured: "Featured",
      allCategories: "All Categories",
      allBrands: "All Brands",
      allConditions: "All Conditions",
      new: "New",
      used: "Used",
      resetFilters: "Reset Filters",
      sortBy: "Sort By",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low",
      newest: "Newest First",
      contactSeller: "Contact Seller",
      brand: "Brand",
      condition: "Condition",
      categories: "Categories",
      title: "Your All-in-One Bike Marketplace",
      subtitle: "Buy and Sell Bikes Online",
      postAd: "Post Your Ad",
      model: "Model",
      price: "Price",
      location: "Location",
      search: "Search",
      footerDescription: "Sri Lanka's largest online marketplace for buying and selling motorcycles and scooters.",
      quickLinks: "Quick Links",
      aboutUs: "About Us",
      howItWorks: "How It Works",
      sellBike: "Sell Your Bike",
      buyBike: "Buy a Bike",
      financing: "Financing Options",
      helpCenter: "Help Center",
      termsConditions: "Terms & Conditions",
      privacyPolicy: "Privacy Policy",
      contactUs: "Contact Us",
      motorcycles: "Motorcycles",
      scooters: "Scooters",
      sportsBikes: "Sports Bikes",
      classicBikes: "Classic Bikes",
      electricBikes: "Electric Bikes",
      trailBikes: "Trail Bikes",
      cruiserBikes: "Cruiser Bikes",
      touringBikes: "Touring Bikes",
      accessories: "Accessories",
      language: "Language",
      allRightsReserved: "All rights reserved."
    },
    sinhala: {
      home: "මුල් පිටුව",
      spareParts: "අමතර කොටස්",
      bikerGear: "බයිකර් ගියර්",
      bikerGearTitle: "බයිකර් ගියර් සහ හිස්වැසුම්",
      bikerGearSubtitle: "සෑම යතුරුපැදි කරුවෙකුටම ආරක්ෂණ උපකරණ",
      helmets: "හිස්වැසුම්",
      gloves: "අත්වැසුම්",
      jackets: "ජැකට්",
      boots: "බූට්",
      rainGear: "වර්ෂා ගියර්",
      reflectiveVests: "පරාවර්තන කබාය",
      helmetTypes: "හිස්වැසුම් වර්ග",
      fullFace: "සම්පූර්ණ මුහුණ",
      halfFace: "අර්ධ මුහුණ",
      modular: "මොඩියුලර්",
      size: "ප්‍රමාණය",
      allSizes: "සියලු ප්‍රමාණ",
      priceRange: "මිල පරාසය",
      allPrices: "සියලු මිල",
      verifiedSeller: "සත්‍යාපිත විකිණුම්කරු පමණයි",
      verified: "සත්‍යාපිත",
      availableGear: "ලභා ගත හැකි ගියර්",
      featured: "විශේෂාංගගත",
      allCategories: "සියලු කාණ්ඩ",
      allBrands: "සියලු සන්නාම",
      allConditions: "සියලු තත්වයන්",
      new: "අලුත්",
      used: "භාවිත කළ",
      resetFilters: "පෙරහන් යළි පිහිටුවන්න",
      sortBy: "අනුපිළිවෙල",
      priceAsc: "මිල: අඩු සිට වැඩි",
      priceDesc: "මිල: වැඩි සිට අඩු",
      newest: "අලුත්ම පළමුව",
      contactSeller: "විකුණුම්කරු අමතන්න",
      brand: "සන්නාමය",
      condition: "තත්වය",
      categories: "වර්ග",
      title: "ශ්‍රී ලංකාවේ බයිසිකල් වෙළඳපොළ",
      subtitle: "අන්තර්ජාලයෙන් බයිසිකල් මිලදී ගන්න සහ විකුණන්න",
      postAd: "ඔබේ දැන්වීම පළ කරන්න",
      model: "ආකෘතිය",
      price: "මිල",
      location: "ස්ථානය",
      search: "සොයන්න",
      footerDescription: "ශ්‍රී ලංකාවේ විශාලතම මෝටර් සයිකල් සහ ස්කූටර් මිලදී ගැනීම සහ විකිණීම සඳහා වන අන්තර්ජාල වෙළඳපොළ.",
      quickLinks: "ඉක්මන් සබැඳි",
      aboutUs: "අප ගැන",
      howItWorks: "එය ක්‍රියාත්මක වන ආකාරය",
      sellBike: "ඔබේ බයිසිකලය විකුණන්න",
      buyBike: "බයිසිකලයක් මිලදී ගන්න",
      financing: "මූල්‍ය විකල්ප",
      helpCenter: "උපකාර මධ්‍යස්ථානය",
      termsConditions: "නියම සහ කොන්දේසි",
      privacyPolicy: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
      contactUs: "අප හා සම්බන්ධ වන්න",
      motorcycles: "මෝටර් සයිකල්",
      scooters: "ස්කූටර්",
      sportsBikes: "ක්‍රීඩා බයිසිකල්",
      classicBikes: "සම්ප්‍රදායික බයිසිකල්",
      electricBikes: "විද්‍යුත් බයිසිකල්",
      trailBikes: "අභියෝග බයිසිකල්",
      cruiserBikes: "ක්‍රූසර් බයිසිකල්",
      touringBikes: "සංචාරක බයිසිකල්",
      accessories: "උපාංග",
      language: "භාෂාව",
      allRightsReserved: "සියලුම අයිතිවාසිකම් ආරක්ෂිතයි."
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'spareParts':
        return <SpareParts translations={translations[language]} />;
      case 'bikerGear':
        return <BikerGear translations={translations[language]} />;
      case 'home':
      default:
        return (
          <>
             <Hero
              translations={translations[language]}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              onPostAdClick={handlePostAdClick}
              onSearch={handleGlobalSearch}
            />

            {showSearchResults && (
              <GlobalSearchResults
                searchFilters={searchFilters}
                onClearSearch={handleClearGlobalSearch}
              />
            )}

            <section
              className={`filters-section relative z-20 ${showSearchResults ? 'mt-6 pb-6' : 'mt-6 lg:mt-[-52px]'}`}
              aria-label={`${translations[language].categories} filters`}
            >
              <div className="container">
                <QuickFilters translations={translations[language]} />
              </div>
            </section>

            {!showSearchResults && (
              <FeaturedListings translations={translations[language]} />
            )}
          </>
        );
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />

        {/* All other pages — rendered WITH Header/Footer */}
        <Route path="*" element={
          <>
            <Header
              language={language}
              setLanguage={setLanguage}
              translations={translations[language]}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onPostAdClick={handlePostAdClick}
            />
            <main className="main-content">
              <Routes>
                <Route path="/" element={renderCurrentPage()} />
                <Route path="/browse/:type" element={<CategoryListRoute />} />
                <Route path="/vehicle/:id" element={<VehicleDetailsRoute />} />
                <Route path="/post-ad" element={
                  <ProtectedRoute>
                    <AddVehicleForm />
                  </ProtectedRoute>
                } />
                <Route path="/showroom-membership" element={<ShowroomMembershipsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer
              language={language}
              setLanguage={setLanguage}
              translations={translations[language]}
            />
            <Chatbot language={language} translations={translations[language]} />
          </>
        } />
      </Routes>

      {showPathwayModal && (
        <SellerPathwayModal
          isDealer={user?.role === 'dealer'}
          onClose={() => setShowPathwayModal(false)}
          onSelectPrivate={() => {
            if (user?.role === 'dealer') return;
            setShowPathwayModal(false);
            navigate('/post-ad');
          }}
          onSelectShowroom={() => {
            setShowPathwayModal(false);
            navigate('/showroom-membership');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        {/* Wrap everything with VehiclesProvider to supply allVehicles + actions */}
        <VehiclesProvider>
          <AppContent />
        </VehiclesProvider>
      </AuthProvider>
    </Router>
  );
}
