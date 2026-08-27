// components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import bikeekaLogo from '../Images/bikeeka.com logos.png';
import './Footer.css';

const Footer = ({ language, setLanguage, translations = {} }) => {
  return (
    <footer className="footer relative overflow-hidden">
      {/* Background Video with Dark Overlay */}
      <div className="footer-video-bg" aria-hidden="true">
        <video
          src={`${process.env.PUBLIC_URL}/Motorcycles_riding_with_motion_blur_202608271629.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="footer-video-overlay" />
      </div>

      <div className="container relative z-10">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <Link to="/">
                <img src={bikeekaLogo} alt="bikeeka.com logo" className="footer-logo-img" />
              </Link>
            </div>
            <p className="footer-description">
              {translations.footerDescription || "Sri Lanka's largest online marketplace for buying and selling motorcycles and scooters."}
            </p>

            {/* Social Links */}
            <div className="social-links">
              <a
                href="https://www.facebook.com/profile.php?id=61583423744748"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
                aria-label="Facebook"
              >
                <FaFacebook className="social-icon" aria-hidden="true" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.youtube.com/@BikeEka"
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

          {/* Quick Links (100% Working Routes) */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.quickLinks || "Quick Links"}</h4>
            <ul className="footer-links">
              <li><Link to="/">{translations.home || "Home"}</Link></li>
              <li><Link to="/browse/all">{translations.buyBike || "Buy a Bike"}</Link></li>
              <li><Link to="/post-ad">{translations.sellBike || "Sell Your Bike"}</Link></li>
              <li><Link to="/spare-parts">{translations.spareParts || "Spare Parts"}</Link></li>
              <li><Link to="/biker-gear">{translations.bikerGear || "Biker Gear"}</Link></li>
            </ul>
          </div>

          {/* Categories (100% Working Category Routes) */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.categories || "Categories"}</h4>
            <ul className="footer-links">
              <li><Link to="/browse/all">All Motorcycles</Link></li>
              <li><Link to="/browse/scooters">Scooters</Link></li>
              <li><Link to="/browse/sport">Sport Bikes</Link></li>
              <li><Link to="/browse/cruiser">Classic / Cruiser</Link></li>
              <li><Link to="/browse/electric">Electric Bikes</Link></li>
              <li><Link to="/browse/trail">Trail Bikes</Link></li>
              <li><Link to="/browse/high-capacity">High Capacity</Link></li>
              <li><Link to="/browse/atv-adv">ATV / ADV</Link></li>
            </ul>
          </div>

          {/* Language and Contact */}
          <div className="footer-section">
            <h4 className="footer-title">{translations.language || "Language & Contact"}</h4>
            <div className="footer-language mb-3">
              <LanguageToggle 
                language={language} 
                setLanguage={setLanguage} 
              />
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <p>
                <FiPhone className="contact-icon" aria-hidden="true" />
                <a href="tel:+94756533513" aria-label="Call 0756533513">0756533513</a>
              </p>
              <p>
                <FiMail className="contact-icon" aria-hidden="true" />
                <a href="mailto:sadthepianist@gmail.com" aria-label="Email sadthepianist@gmail.com">sadthepianist@gmail.com</a>
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
            <p>&copy; {new Date().getFullYear()} BIKE EKA.COM. {translations.allRightsReserved || "All rights reserved."}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;