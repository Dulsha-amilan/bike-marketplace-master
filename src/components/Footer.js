// components/Footer.js
import React from 'react';
import LanguageToggle from './LanguageToggle';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = ({ language, setLanguage, translations }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <h3>🏍️BIKE EKA.COM</h3>
            </div>
            <p className="footer-description">
              {translations.footerDescription}
            </p>

            {/* Social Links with real icons */}
            <div className="social-links">
              <a
                href="https://www.facebook.com/share/1GUCohtzxN/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
                aria-label="Facebook"
              >
                <FaFacebook className="social-icon" aria-hidden="true" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.youtube.com/@ClemPerera"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link youtube"
                aria-label="YouTube"
              >
                <FaYoutube className="social-icon" aria-hidden="true" />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.quickLinks}</h4>
            <ul className="footer-links">
              <li><a href="#about">{translations.aboutUs}</a></li>
              <li><a href="#how-it-works">{translations.howItWorks}</a></li>
              <li><a href="#sell-bike">{translations.sellBike}</a></li>
              <li><a href="#buy-bike">{translations.buyBike}</a></li>
              <li><a href="#financing">{translations.financing}</a></li>
              <li><a href="#help-center">{translations.helpCenter}</a></li>
              <li><a href="#terms">{translations.termsConditions}</a></li>
              <li><a href="#privacy">{translations.privacyPolicy}</a></li>
              <li><a href="#contact">{translations.contactUs}</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.categories}</h4>
            <ul className="footer-links">
              <li><a href="#motorcycles">{translations.motorcycles}</a></li>
              <li><a href="#scooters">{translations.scooters}</a></li>
              <li><a href="#sports-bikes">{translations.sportsBikes}</a></li>
              <li><a href="#classic-bikes">{translations.classicBikes}</a></li>
              <li><a href="#electric-bikes">{translations.electricBikes}</a></li>
              <li><a href="#trail-bikes">{translations.trailBikes}</a></li>
              <li><a href="#cruiser-bikes">{translations.cruiserBikes}</a></li>
              <li><a href="#touring-bikes">{translations.touringBikes}</a></li>
              <li><a href="#accessories">{translations.accessories}</a></li>
            </ul>
          </div>

          {/* Language and Contact */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.language}</h4>
            <div className="footer-language">
              <LanguageToggle 
                language={language} 
                setLanguage={setLanguage} 
              />
            </div>

            {/* Contact Info with real icons (no emojis) */}
            <div className="contact-info">
              <p>
                <FiPhone className="contact-icon" aria-hidden="true" />
                <a href="tel:+94714029197" aria-label="Call 0714029197">0714029197</a>
              </p>
              <p>
                <FiMail className="contact-icon" aria-hidden="true" />
                <a href="mailto:info@bikehublk.com" aria-label="Email info@bikehublk.com">info@bikehublk.com</a>
              </p>
              <p>
                <FiMapPin className="contact-icon" aria-hidden="true" />
                <span>Rathnapura, Sri Lanka</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 BIKE EKA.COM. {translations.allRightsReserved}</p>
            <div className="footer-bottom-links">
              <a href="#terms">{translations.termsConditions}</a>
              <span className="separator">|</span>
              <a href="#privacy">{translations.privacyPolicy}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;