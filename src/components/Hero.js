import React, { useState, useEffect } from 'react';
import { Bike, ShieldCheck, Wrench, ShoppingBag } from 'lucide-react';
import SearchBar from './SearchBar';
import desktopVideo from '../herovideos/Motorcycle_montage_scenic_roads_202606261152.mp4';
import mobileVideo from '../herovideos/Motorcycle_montage_scenic_roads_202606261153.mp4';

const Hero = ({ translations, searchFilters, setSearchFilters }) => {
    const [animationState, setAnimationState] = useState('initial'); // 'initial', 'shifting', 'revealed'

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
        <div className="relative min-h-[650px] flex items-center justify-center overflow-hidden bg-black text-white">
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

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center px-4 py-20">

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

                    {/* Search Bar (Reveals after text shifts to the left) */}
                    <div 
                        className={`mt-8 transition-all duration-1000 delay-200 ease-out ${
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

                    {/* Features Badge (Reveals after search bar) */}
                    <div 
                        className={`flex flex-wrap gap-4 pt-6 transition-all duration-1000 delay-500 ease-out ${
                            animationState === 'revealed'
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                    >
                        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 mx-auto lg:mx-0">
                            <Bike className="w-4 h-4 text-yellow-500" />
                            <span>Thousands of bikes listed daily</span>
                        </div>
                    </div>
                </div>

                {/* Right Content (Premium Site Features - Reveals after text shifts to the left) */}
                <div 
                    className={`hidden lg:flex flex-col gap-6 relative transition-all duration-[1200ms] delay-300 ease-out ${
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
                        {/* Feature 1 */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group">
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

                        {/* Feature 2 */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group">
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

                        {/* Feature 3 */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left group">
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
