import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import './AdBannerComponents.css';

/**
 * 1. Leaderboard Header Ad Banner (970x90)
 */
export const LeaderboardAdBanner = ({ ad, isPreview = false }) => {
  // If not in preview mode, hide completely if ad is missing or disabled
  if (!isPreview) {
    if (!ad) return null;
    if (ad.isEnabled === false || ad.isEnabled === 0 || ad.isEnabled === 'false' || ad.isEnabled === '0') {
      return null;
    }
  }

  const title = ad?.title || '';
  const subtitle = ad?.subtitle || '';
  const badgeText = ad?.badgeText || '';
  const buttonText = ad?.buttonText || '';
  const linkUrl = ad?.linkUrl || '#';
  const imageUrl = ad?.imageUrl || '';

  const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

  const content = (
    <div className="ad-banner-container ad-leaderboard-wrap">
      <span className="ad-banner-tag">AD • LEADERBOARD (970X90)</span>
      {imageUrl ? (
        <div className="ad-image-frame">
          <img src={imageUrl} alt={title || 'Leaderboard Ad'} className="ad-uploaded-img" />
        </div>
      ) : (
        <div className="ad-leaderboard-card">
          <div className="ad-leaderboard-content">
            {badgeText && <span className="ad-badge-sale">{badgeText}</span>}
            <div className="ad-leaderboard-text">
              {title && <h4 className="ad-leaderboard-title">{title}</h4>}
              {subtitle && <p className="ad-leaderboard-subtitle">{subtitle}</p>}
            </div>
          </div>
          {buttonText && (
            <button type="button" className="ad-btn-yellow">
              {buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </a>
    );
  }

  return (
    <Link to={linkUrl} style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </Link>
  );
};

/**
 * 2. Skyscraper Side Ad Banner (160x600)
 */
export const SkyscraperAdBanner = ({ ad, isPreview = false }) => {
  // If not in preview mode, hide completely if ad is missing or disabled
  if (!isPreview) {
    if (!ad) return null;
    if (ad.isEnabled === false || ad.isEnabled === 0 || ad.isEnabled === 'false' || ad.isEnabled === '0') {
      return null;
    }
  }

  const title = ad?.title || '';
  const subtitle = ad?.subtitle || '';
  const highlightText = ad?.highlightText || '';
  const buttonText = ad?.buttonText || '';
  const footerText = ad?.footerText || '';
  const linkUrl = ad?.linkUrl || '#';
  const imageUrl = ad?.imageUrl || '';

  const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

  const content = (
    <div className="ad-banner-container ad-skyscraper-wrap">
      <span className="ad-banner-tag">AD • SKYSCRAPER (160X600)</span>
      {imageUrl ? (
        <div className="ad-image-frame">
          <img src={imageUrl} alt={title || 'Skyscraper Ad'} className="ad-uploaded-img" />
        </div>
      ) : (
        <div className="ad-skyscraper-card">
          <div className="ad-skyscraper-header">
            <Shield className="ad-shield-icon" aria-hidden="true" />
            {title && <h4 className="ad-skyscraper-title">{title}</h4>}
            {subtitle && <p className="ad-skyscraper-subtitle">{subtitle}</p>}
          </div>

          {highlightText && (
            <div className="ad-rate-box">
              <span className="ad-rate-value">{highlightText}</span>
            </div>
          )}

          <div className="ad-skyscraper-footer">
            {buttonText && (
              <button type="button" className="ad-btn-cyan">
                {buttonText}
              </button>
            )}
            {footerText && <span className="ad-terms-text">{footerText}</span>}
          </div>
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {content}
      </a>
    );
  }

  return (
    <Link to={linkUrl} style={{ textDecoration: 'none', display: 'inline-block' }}>
      {content}
    </Link>
  );
};

/**
 * 3. Square Box Ad Banner (250x250)
 */
export const SquareBoxAdBanner = ({ ad, isPreview = false }) => {
  // If not in preview mode, hide completely if ad is missing or disabled
  if (!isPreview) {
    if (!ad) return null;
    if (ad.isEnabled === false || ad.isEnabled === 0 || ad.isEnabled === 'false' || ad.isEnabled === '0') {
      return null;
    }
  }

  const title = ad?.title || '';
  const subtitle = ad?.subtitle || '';
  const badgeText = ad?.badgeText || '';
  const buttonText = ad?.buttonText || '';
  const linkUrl = ad?.linkUrl || '#';
  const imageUrl = ad?.imageUrl || '';

  const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

  const content = (
    <div className="ad-banner-container ad-square-wrap">
      <span className="ad-banner-tag">AD • SQUARE (250X250)</span>
      {imageUrl ? (
        <div className="ad-image-frame">
          <img src={imageUrl} alt={title || 'Square Ad'} className="ad-uploaded-img" />
        </div>
      ) : (
        <div className="ad-square-card">
          <div className="ad-square-top">
            {badgeText && <span className="ad-badge-orange">{badgeText}</span>}
            {title && <h4 className="ad-square-title">{title}</h4>}
            {subtitle && <p className="ad-square-subtitle">{subtitle}</p>}
          </div>

          {buttonText && (
            <button type="button" className="ad-btn-full-yellow">
              {buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {content}
      </a>
    );
  }

  return (
    <Link to={linkUrl} style={{ textDecoration: 'none', display: 'inline-block' }}>
      {content}
    </Link>
  );
};
