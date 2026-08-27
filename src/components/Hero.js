import React, { useRef } from 'react';
import { PlusCircle } from 'lucide-react';
import { FaHandshake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = ({ translations, searchFilters, setSearchFilters, onPostAdClick, onSearch }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const contentRef = useRef(null);

    useGSAP(() => {
        if (!contentRef.current) return;

        gsap.to(contentRef.current, {
            opacity: 0,
            y: -40,
            ease: 'power1.out',
            scrollTrigger: {
                start: 0,
                end: 350,
                scrub: true,
                invalidateOnRefresh: true,
            },
        });
    }, { scope: contentRef });

    return (
        <div className="hero-container hero-sticky relative min-h-[680px] lg:min-h-screen flex items-center justify-center bg-black text-white pb-12 lg:pb-0 z-0">
            {/* Background Media */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Desktop Image (visible on md screens and larger) */}
                <img
                    className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
                    src={`${process.env.PUBLIC_URL}/images/heroimage.png`}
                    alt="Bike Marketplace Banner"
                />
                {/* Mobile Image (visible on mobile screens) */}
                <img
                    className="block md:hidden absolute inset-0 w-full h-full object-cover object-center"
                    src={`${process.env.PUBLIC_URL}/images/mobileimage.jpeg`}
                    alt="Bike Marketplace Mobile Banner"
                />
                
                {/* Clean Neutral Overlays - No Blue Filter */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-[1]" />
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6 sm:px-10 lg:px-12 pt-20 pb-8 lg:py-20">

                {/* Left Content (Text Section & Trust Badges) */}
                <div 
                    ref={contentRef}
                    className="w-full"
                >
                    <div className="max-w-2xl text-left">
                        {/* 3-Line Racing Italic Title */}
                        <h1 className="hero-racing-title tracking-tight leading-[0.93] select-none">
                            <span className="block text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] whitespace-nowrap">
                                {translations?.heroTitle1 || "SRI LANKA'S"}
                            </span>
                            <span className="block text-[#E50914] text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-[84px] drop-shadow-[0_4px_18px_rgba(229,9,20,0.35)] my-0.5 sm:my-1 whitespace-nowrap">
                                {translations?.heroTitle2 || "TRUSTED"}
                            </span>
                            <span className="block text-white text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[50px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] whitespace-nowrap">
                                {translations?.heroTitle3 || "BIKE MARKETPLACE"}
                            </span>
                        </h1>

                        {/* Subtitle Lines */}
                        <div className="mt-5 sm:mt-6 space-y-1 text-neutral-200 text-base sm:text-lg lg:text-[19px] font-normal leading-snug drop-shadow-md">
                            <p>{translations?.heroSubtitle1 || "Buy or sell your bike with confidence."}</p>
                            <p>{translations?.heroSubtitle2 || "Verified listings, best prices, and a trusted community."}</p>
                        </div>

                        {/* Three Trust Badges Row */}
                        <div className="mt-6 sm:mt-8 pt-2 flex flex-nowrap items-center justify-between sm:justify-start gap-2 sm:gap-5 lg:gap-6 w-full max-w-lg sm:max-w-none">
                            {/* Badge 1: Verified Listings */}
                            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex-shrink-0" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 1L3 5.5V17C3 27.5 9.5 35.8 18 39C26.5 35.8 33 27.5 33 17V5.5L18 1Z" fill="#E50914" />
                                    <path d="M11 18.5L15.5 23.5L25 13" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="text-white text-[10px] xs:text-[11px] sm:text-[15px] font-bold leading-[1.15] select-none whitespace-nowrap">
                                    <div>{translations?.badgeVerified1 || "Verified"}</div>
                                    <div>{translations?.badgeVerified2 || "Listings"}</div>
                                </div>
                            </div>

                            {/* Divider 1 */}
                            <div className="h-6 sm:h-12 w-[1px] sm:w-[1.5px] bg-white/30 sm:bg-white/40 self-center flex-shrink-0" />

                            {/* Badge 2: Best Prices Guaranteed */}
                            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex-shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="translate(18, 18) rotate(45)">
                                        <path d="M-7 13 C-7 14 -6 15 -4.5 15 H4.5 C6 15 7 14 7 13 V-8 L2 -14 C1 -15 -1 -15 -2 -14 L-7 -8 Z" fill="#E50914" />
                                        <circle cx="0" cy="-7" r="2.5" fill="#000000" />
                                    </g>
                                </svg>
                                <div className="text-white text-[10px] xs:text-[11px] sm:text-[15px] font-bold leading-[1.15] select-none whitespace-nowrap">
                                    <div>{translations?.badgePrices1 || "Best Prices"}</div>
                                    <div>{translations?.badgePrices2 || "Guaranteed"}</div>
                                </div>
                            </div>

                            {/* Divider 2 */}
                            <div className="h-6 sm:h-12 w-[1px] sm:w-[1.5px] bg-white/30 sm:bg-white/40 self-center flex-shrink-0" />

                            {/* Badge 3: Buy & Sell with Confidence */}
                            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                                <FaHandshake className="w-6 h-6 sm:w-10 sm:h-10 lg:w-11 lg:h-11 text-[#E50914] flex-shrink-0" />
                                <div className="text-white text-[10px] xs:text-[11px] sm:text-[15px] font-bold leading-[1.15] select-none whitespace-nowrap">
                                    <div>{translations?.badgeConfidence1 || "Buy & Sell"}</div>
                                    <div>{translations?.badgeConfidence2 || "with Confidence"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Post Ad CTA */}
                    {user?.role !== 'admin' && (
                        <div 
                            className="flex justify-center sm:justify-start pt-7 transition-all duration-700 ease-out lg:hidden relative z-10"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (onPostAdClick) {
                                        onPostAdClick();
                                    } else {
                                        navigate('/post-ad');
                                    }
                                }}
                                className="mobile-post-ad-btn group"
                            >
                                <span className="shimmer-ray" />
                                <PlusCircle className="btn-icon-yellow relative z-10 h-5 w-5" />
                                <span className="relative z-10">{translations?.postAd || 'Post Your Ad'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hero;
