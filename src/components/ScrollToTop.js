import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable native browser scroll restoration so it doesn't fight React Router
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetToTop = () => {
      // 1. Standard window & document scroll reset
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      // 2. Lenis smooth scroll engine reset (critical for SPA navigation)
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true, force: true });
        window.__lenis.resize();
      }
    };

    // Immediate execution
    resetToTop();

    // After animation frame
    const rafId = requestAnimationFrame(() => {
      resetToTop();
    });

    // After component rendering/mounting finishes
    const t1 = setTimeout(resetToTop, 50);
    const t2 = setTimeout(resetToTop, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;