import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldCheck, Wrench, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from './AuthContext';
import desktopVideo from '../herovideos/Motorcycle_montage_scenic_roads_202606261152.mp4';
import mobileVideo from '../herovideos/Motorcycle_montage_scenic_roads_202606261153.mp4';

const Hero = ({ translations, searchFilters, setSearchFilters, onPostAdClick }) => {
    const { user } = useAuth();
    const [animationState, setAnimationState] = useState('initial'); // 'initial', 'shifting', 'revealed'
    const navigate = useNavigate();

    useEffect(() => {
        // Step 1: Display centered text, then start shifting to the left
        const shiftTimer = setTimeout(() => {
            setAnimationState('shifting');
        }, 1800);

        // Step 2: Once shift is complete, reveal search form and right-side elements
        const revealTimer = setTimeout(() => {
            setAnimationState('revealed');
        }, 2800);

        return () => {
            clearTimeout(shiftTimer);
            clearTimeout(revealTimer);
        };
    }, []);

    return (
        <div className="relative min-h-[650px] flex items-center justify-center overflow-hidden bg-black text-white pb-12 lg:pb-0">
            {/* Background Videos */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Desktop Video (visible on md screens and larger) */}
                <video
                    className="hidden md:block absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={desktopVideo}
                />
                {/* Mobile Video (visible on mobile screens) */}
                <video
                    className="block md:hidden absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={mobileVideo}
                />
                
                {/* Clean Neutral Overlays - No Blue Filter */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-[1]" />
            </div>

            <div className="container relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center px-4 pt-20 pb-8 lg:py-20">

                {/* Left Content (Text Section & Search Bar) */}
                <div 
                    className={`w-full transition-all duration-[1000ms] ease-in-out ${
                        animationState === 'initial'
                            ? 'lg:translate-x-[50%]'
                            : 'lg:translate-x-0'
                    }`}
                >
                    {/* Header Text */}
                    <div className={`space-y-4 max-w-xl transition-all duration-[1000ms] ${
                        animationState === 'initial'
                            ? 'text-center mx-auto'
                            : 'lg:text-left lg:mx-0 text-center mx-auto'
                    }`}>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm">
                                Ride Your
                            </span>
                            <span className="block text-white drop-shadow-lg">Dream Bike</span>
                        </h1>
                        <p className="text-xl text-neutral-200 leading-relaxed font-medium drop-shadow">
                            {translations.subtitle}
                        </p>
                    </div>

                    {/* Search Bar (Reveals after text shifts to the left - Hidden on mobile/tablet) */}
                    <div 
                        className={`mt-8 transition-all duration-1000 delay-200 ease-out hidden lg:block ${
                            animationState === 'revealed'
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                        }`}
                    >
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
                            <SearchBar
                                searchFilters={searchFilters}
                                setSearchFilters={setSearchFilters}
                                translations={translations}
                            />
                        </div>
                    </div>

                    {/* Mobile Post Ad CTA */}
                    {user?.role !== 'admin' && (
                        <div 
                            className={`flex justify-center pt-6 transition-all duration-1000 delay-500 ease-out lg:hidden ${
                                animationState === 'revealed'
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}
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
                                className="group relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full border border-white/35 bg-white/15 px-6 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-yellow-400/20 opacity-90" />
                                <span className="absolute -left-8 top-0 h-full w-14 rotate-12 bg-white/35 blur-md transition-transform duration-500 group-hover:translate-x-44" />
                                <PlusCircle className="relative z-10 h-5 w-5 text-yellow-300" />
                                <span className="relative z-10">{translations.postAd}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Content (Premium Site Features - Reveals after text shifts to the left) */}
                <div 
                    className={`flex flex-col gap-6 relative transition-all duration-[1200ms] delay-300 ease-out ${
                        animationState === 'revealed'
                            ? 'opacity-100 translate-x-0 scale-100'
                            : 'opacity-0 translate-x-16 scale-95 pointer-events-none'
                    }`}
                >
                    <div className="space-y-2 mb-2 text-left">
                        <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                            Our Platform
                        </span>
                        <h2 className="text-3xl font-extrabold text-white drop-shadow">
                            Key Marketplace Features
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Feature 1 — waterfall card 1 (no delay) */}
                        <div
                            className={`flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group
                                waterfall-card`}
                            style={{
                                opacity: animationState === 'revealed' ? 1 : 0,
                                transform: animationState === 'revealed' ? 'translateY(0)' : 'translateY(-32px)',
                                transition: 'opacity 0.45s ease-out 0ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) 0ms',
                            }}
                        >
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Verified Marketplace</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Browse thousands of trusted motorcycles and scooters. Inspect seller verification for a secure transaction.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 — waterfall card 2 (120ms delay) */}
                        <div
                            className={`flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group
                                waterfall-card`}
                            style={{
                                opacity: animationState === 'revealed' ? 1 : 0,
                                transform: animationState === 'revealed' ? 'translateY(0)' : 'translateY(-32px)',
                                transition: 'opacity 0.45s ease-out 120ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) 120ms',
                            }}
                        >
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Genuine Spare Parts</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Find components from top manufacturers. Filters make it easy to find engine parts, tyres, and wheels.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 — waterfall card 3 (240ms delay) */}
                        <div
                            className={`flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group
                                waterfall-card`}
                            style={{
                                opacity: animationState === 'revealed' ? 1 : 0,
                                transform: animationState === 'revealed' ? 'translateY(0)' : 'translateY(-32px)',
                                transition: 'opacity 0.45s ease-out 240ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) 240ms',
                            }}
                        >
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Premium Rider Gear</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Ride safely with our curated collection of safety helmets, protective riding jackets, gloves, and boots.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
