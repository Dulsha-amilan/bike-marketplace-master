// components/Header.js - Updated with logo image
import React, { useState, useEffect, useRef } from 'react';
import LanguageToggle from './LanguageToggle';
import bikeekaLogo from '../Images/bikeeka.com logos.png'; // <-- your logo
import './Header.css';

const Header = ({ language, setLanguage, translations, currentPage, setCurrentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div
            className="logo"
            onClick={() => setCurrentPage('home')}
            style={{ cursor: 'pointer' }}
            aria-label="Go to home"
          >
            <img
              src={bikeekaLogo}
              alt="bikeeka.com logo"
              className="logo-img"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              {translations.home}
            </button>
            <button 
              className={`nav-link ${currentPage === 'spareParts' ? 'active' : ''}`}
              onClick={() => setCurrentPage('spareParts')}
            >
              {translations.spareParts}
            </button>
            <button 
              className={`nav-link ${currentPage === 'bikerGear' ? 'active' : ''}`}
              onClick={() => setCurrentPage('bikerGear')}
            >
              {translations.bikerGear}
            </button>
            <LanguageToggle 
              language={language} 
              setLanguage={setLanguage} 
            />
            <button className="cta-button">
              {translations.postAd}
            </button>
          </nav>

          {/* Mobile Dropdown Button */}
          <div className="mobile-nav" ref={dropdownRef}>
            <button 
              className="dropdown-toggle"
              onClick={toggleDropdown}
              aria-label="Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <div className="dropdown-item">
                    <button 
                      className="dropdown-link"
                      onClick={() => { setCurrentPage('home'); setIsDropdownOpen(false); }}
                    >
                      {translations.home}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <button 
                      className="dropdown-link"
                      onClick={() => { setCurrentPage('spareParts'); setIsDropdownOpen(false); }}
                    >
                      {translations.spareParts}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <button 
                      className="dropdown-link"
                      onClick={() => { setCurrentPage('bikerGear'); setIsDropdownOpen(false); }}
                    >
                      {translations.bikerGear}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <LanguageToggle 
                      language={language} 
                      setLanguage={setLanguage} 
                    />
                  </div>
                  <div className="dropdown-item">
                    <button 
                      className="cta-button mobile-cta"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {translations.postAd}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;