import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import bikeekaLogo from '../Images/bikeeka.com logos.png';
import './Header.css';

const Header = ({ language, setLanguage, translations, currentPage, setCurrentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isHome = currentPage === 'home';

  const handleLogoClick = () => {
    setCurrentPage('home');
    navigate('/');
    setIsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);

  // Close on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keyup', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keyup', handleEsc);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (!isDropdownOpen) {
      const y = parseInt((document.body.style.top || '0').replace('-', ''), 10) || 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (y) window.scrollTo(0, y);
      return;
    }
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }, [isDropdownOpen]);

  return (
    <header
      className={`header ${isHome ? 'header--home' : 'header--default'} ${isScrolled ? 'header--scrolled' : 'header--top'}`}
    >
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div
            className="logo"
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            aria-label="Go to home"
          >
            <img src={bikeekaLogo} alt="bikeeka.com logo" className="logo-img" />
          </div>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav" aria-label="Primary">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              aria-current={currentPage === 'home' ? 'page' : undefined}
              onClick={() => setCurrentPage('home')}
            >
              {translations.home}
            </button>
            <button
              className={`nav-link ${currentPage === 'spareParts' ? 'active' : ''}`}
              aria-current={currentPage === 'spareParts' ? 'page' : undefined}
              onClick={() => setCurrentPage('spareParts')}
            >
              {translations.spareParts}
            </button>
            <button
              className={`nav-link ${currentPage === 'bikerGear' ? 'active' : ''}`}
              aria-current={currentPage === 'bikerGear' ? 'page' : undefined}
              onClick={() => setCurrentPage('bikerGear')}
            >
              {translations.bikerGear}
            </button>

            <LanguageToggle language={language} setLanguage={setLanguage} />

            <button
              className={`cta-button ${isHome && !isScrolled ? 'cta-button--ghost-light' : ''}`}
              onClick={() => navigate('/post-ad')}
            >
              {translations.postAd}
            </button>
          </nav>

          {/* Mobile */}
          <div className="mobile-nav" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={toggleDropdown}
              aria-label="Menu"
              aria-expanded={isDropdownOpen}
              aria-controls="header-mobile-menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu" id="header-mobile-menu" role="menu">
                <div className="dropdown-content">
                  <div className="dropdown-item">
                    <button
                      className="dropdown-link"
                      onClick={() => {
                        setCurrentPage('home');
                        setIsDropdownOpen(false);
                      }}
                    >
                      {translations.home}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <button
                      className="dropdown-link"
                      onClick={() => {
                        setCurrentPage('spareParts');
                        setIsDropdownOpen(false);
                      }}
                    >
                      {translations.spareParts}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <button
                      className="dropdown-link"
                      onClick={() => {
                        setCurrentPage('bikerGear');
                        setIsDropdownOpen(false);
                      }}
                    >
                      {translations.bikerGear}
                    </button>
                  </div>
                  <div className="dropdown-item">
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                  </div>
                  <div className="dropdown-item">
                    <button
                      className={`cta-button mobile-cta ${isHome && !isScrolled ? 'cta-button--ghost-light' : ''}`}
                      onClick={() => {
                        navigate('/post-ad');
                        setIsDropdownOpen(false);
                      }}
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