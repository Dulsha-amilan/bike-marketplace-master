// App.js - Updated with glass Filters section + CategoryList + VehicleDetails routes + ScrollToTop
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import QuickFilters from './components/QuickFilters';
import FeaturedListings from './components/FeaturedListings';
import SpareParts from './components/SpareParts';
import BikerGear from './components/BikerGear';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

import './styles/globals.css';
import heroVideo from './components/video/cs.mp4';

import CategoryList from './components/CategoryList';
import VehicleDetails from './components/VehicleDetails'; // ensure path matches your file
import { sampleVehicles } from './data/sampleVehicles';
import ScrollToTop from './components/ScrollToTop'; // NEW

function App() {
  const [language, setLanguage] = useState('english');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchFilters, setSearchFilters] = useState({
    brand: '',
    model: '',
    priceRange: '',
    location: ''
  });

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
      title: "Sri Lanka's Bike Marketplace",
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
      availableGear: "ලഭා ගත හැකි ගියර්",
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
      featured: "විශේෂ ලැයිස්තුව",
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
            <div className="hero-section">
              <video
                className="hero-bg-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              >
                <source src={heroVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="hero-overlay"></div>
              <div className="container hero-content">
                <h1 className="hero-title">{translations[language].title}</h1>
                <p className="hero-subtitle">{translations[language].subtitle}</p>
                <SearchBar
                  searchFilters={searchFilters}
                  setSearchFilters={setSearchFilters}
                  translations={translations[language]}
                />
              </div>
            </div>

            <section
              className="filters-section"
              aria-label={`${translations[language].categories} filters`}
            >
              <div className="container">
                <div className="glass-filters">
                  <QuickFilters translations={translations[language]} />
                </div>
              </div>
            </section>

            <FeaturedListings translations={translations[language]} />
          </>
        );
    }
  };

  return (
    <Router>
      <ScrollToTop /> {/* NEW: scroll-to-top on navigation (Safari-friendly) */}
      <div className="App">
        <Header
          language={language}
          setLanguage={setLanguage}
          translations={translations[language]}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={renderCurrentPage()} />
            <Route path="/browse/:type" element={<CategoryList allVehicles={sampleVehicles} />} />
            <Route path="/vehicle/:id" element={<VehicleDetails allVehicles={sampleVehicles} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer
          language={language}
          setLanguage={setLanguage}
          translations={translations[language]}
        />
        <Chatbot language={language} translations={translations[language]} />
      </div>
    </Router>
  );
}

export default App;