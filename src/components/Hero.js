import React from 'react';
import { Bike } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = ({ translations, searchFilters, setSearchFilters }) => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
            {/* Abstract Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-yellow-500/20 blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center px-4 py-20">

                {/* Left Content */}
                <div className="text-left space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                Ride Your
                            </span>
                            <span className="block text-white">Dream Bike</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
                            {translations.subtitle}
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
                        <SearchBar
                            searchFilters={searchFilters}
                            setSearchFilters={setSearchFilters}
                            translations={translations}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                            <Bike className="w-4 h-4 text-yellow-500" />
                            <span>Thousands of bikes listed daily</span>
                        </div>
                    </div>
                </div>

                {/* Right Animation (CSS Bike Representation) */}
                <div className="hidden lg:flex justify-center relative">
                    {/* Stylized Moving Bike Animation */}
                    <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center">
                        {/* Decorative Circle */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>

                        {/* Bike Illustration (Using SVG or Composition) */}
                        <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                            <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl filter">
                                <defs>
                                    <linearGradient id="bikeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#d97706" />
                                    </linearGradient>
                                </defs>
                                {/* Wheels */}
                                <circle cx="40" cy="90" r="25" fill="none" stroke="#e2e8f0" strokeWidth="4" className="animate-spin" style={{ transformOrigin: '40px 90px', animationDuration: '2s' }} />
                                <circle cx="160" cy="90" r="25" fill="none" stroke="#e2e8f0" strokeWidth="4" className="animate-spin" style={{ transformOrigin: '160px 90px', animationDuration: '2s' }} />

                                {/* Body */}
                                <path d="M40 90 L80 90 L110 50 L150 50 L160 90" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M110 50 L90 50 L70 70 L90 70" fill="url(#bikeGradient)" />
                                <path d="M140 50 L130 30 L150 30" fill="none" stroke="url(#bikeGradient)" strokeWidth="4" strokeLinecap="round" />

                                {/* Speed Lines */}
                                <path d="M10 60 L-20 60" stroke="white" strokeWidth="2" strokeOpacity="0.5" className="animate-dash" />
                                <path d="M10 80 L-10 80" stroke="white" strokeWidth="2" strokeOpacity="0.3" className="animate-dash delay-75" />
                            </svg>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
