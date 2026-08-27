import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const variantConfig = {
  fadeUp: { opacity: 0, y: 50 },
  fadeIn: { opacity: 0 },
  slideLeft: { opacity: 0, x: -50 },
  slideRight: { opacity: 0, x: 50 },
  scaleUp: { opacity: 0, scale: 0.92 },
};

export function AnimateOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.8,
  stagger = 0.12,
  className = '',
  staggerChildren = false,
  start = 'top 88%',
  once = true,
  style = {},
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const fromVars = variantConfig[variant] || variantConfig.fadeUp;
      const targets = staggerChildren
        ? containerRef.current.children
        : containerRef.current;

      gsap.set(targets, fromVars);

      ScrollTrigger.create({
        trigger: containerRef.current,
        start,
        once,
        onEnter: () => {
          gsap.to(targets, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration,
            delay,
            stagger: staggerChildren ? stagger : 0,
            ease: 'power3.out',
            overwrite: true,
          });
        },
      });
    },
    { scope: containerRef, dependencies: [variant, delay, duration, stagger, staggerChildren, start, once] }
  );

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
}

export default AnimateOnScroll;
