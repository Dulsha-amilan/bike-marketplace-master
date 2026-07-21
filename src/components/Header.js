import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LanguageToggle from './LanguageToggle';
import bikeekaLogo from '../Images/bikeeka.com logos.png';
import './Header.css';

const Header = ({ language, setLanguage, translations, currentPage, setCurrentPage, onPostAdClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsUserMenuOpen(false);
      }
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

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

            {isAuthenticated && user?.role !== 'admin' && (
              <button
                className={`cta-button ${isHome && !isScrolled ? 'cta-button--ghost-light' : ''}`}
                onClick={onPostAdClick || (() => navigate('/post-ad'))}
              >
                {translations.postAd}
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="header-user-menu" ref={userMenuRef}>
                <button
                  className="header-user-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="User menu"
                >
                  <span className="header-avatar">{getInitials(user?.name)}</span>
                  <span className="header-user-name">{user?.name?.split(' ')[0]}</span>
                  <svg className={`header-chevron ${isUserMenuOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="header-user-dropdown" role="menu">
                    <div className="header-user-info">
                      <span className="header-avatar header-avatar--lg">{getInitials(user?.name)}</span>
                      <div>
                        <div className="header-user-fullname">{user?.name}</div>
                        <div className="header-user-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="header-user-divider"></div>
                    {user?.role !== 'admin' && (
                      <button className="header-user-option" onClick={() => { setIsUserMenuOpen(false); if (onPostAdClick) { onPostAdClick(); } else { navigate('/post-ad'); } }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Post an Ad
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button className="header-user-option" onClick={() => { setIsUserMenuOpen(false); navigate('/admin'); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <line x1="9" y1="3" x2="9" y2="21"/>
                          <line x1="9" y1="9" x2="21" y2="9"/>
                        </svg>
                        Admin Dashboard
                      </button>
                    )}
                    <button className="header-user-option header-user-option--danger" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth-btns">
                <button className="header-login-btn" onClick={() => navigate('/login')}>Sign In</button>
                <button className="header-register-btn" onClick={() => navigate('/register')}>Register</button>
              </div>
            )}
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
                  {/* User info at top of mobile menu */}
                  {isAuthenticated && (
                    <div className="dropdown-user-header">
                      <span className="header-avatar">{getInitials(user?.name)}</span>
                      <div>
                        <div className="dropdown-user-name">{user?.name}</div>
                        <div className="dropdown-user-email">{user?.email}</div>
                      </div>
                    </div>
                  )}

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
                  {isAuthenticated && (
                    <div className="dropdown-item">
                      <button
                        className="dropdown-link"
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Profile
                      </button>
                    </div>
                  )}
                  {isAuthenticated && user?.role !== 'admin' && (
                    <div className="dropdown-item">
                      <button
                        className={`cta-button mobile-cta ${isHome && !isScrolled ? 'cta-button--ghost-light' : ''}`}
                        onClick={() => {
                          if (onPostAdClick) {
                            onPostAdClick();
                          } else {
                            navigate('/post-ad');
                          }
                          setIsDropdownOpen(false);
                        }}
                      >
                        {translations.postAd}
                      </button>
                    </div>
                  )}
                  {isAuthenticated && user?.role === 'admin' && (
                    <div className="dropdown-item">
                      <button
                        className="dropdown-link"
                        onClick={() => {
                          navigate('/admin');
                          setIsDropdownOpen(false);
                        }}
                      >
                        Admin Dashboard
                      </button>
                    </div>
                  )}

                  {/* Auth links in mobile menu */}
                  {isAuthenticated ? (
                    <div className="dropdown-item">
                      <button
                        className="dropdown-link dropdown-link--danger"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="dropdown-item">
                        <button
                          className="dropdown-link"
                          onClick={() => {
                            navigate('/login');
                            setIsDropdownOpen(false);
                          }}
                        >
                          Sign In
                        </button>
                      </div>
                      <div className="dropdown-item">
                        <button
                          className="dropdown-link dropdown-link--accent"
                          onClick={() => {
                            navigate('/register');
                            setIsDropdownOpen(false);
                          }}
                        >
                          Create Account
                        </button>
                      </div>
                    </>
                  )}
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