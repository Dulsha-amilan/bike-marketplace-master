import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ smooth = false }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
    const isIOS = typeof navigator !== 'undefined' &&
      (/iP(ad|hone|od)/.test(navigator.platform) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document));
    const behavior = smooth && supportsSmooth && !isIOS ? 'smooth' : 'auto';

    // Ensure layout is flushed before scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;