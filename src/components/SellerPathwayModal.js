import React from 'react';
import { User, Briefcase, X, ArrowRight } from 'lucide-react';

export default function SellerPathwayModal({ isDealer = false, onClose, onSelectPrivate, onSelectShowroom }) {


  return (
    <>
      {/* Main Pathway Modal Backdrop */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
        <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl p-8 md:p-12 border border-slate-100/80 overflow-hidden transition-all duration-300 transform scale-100 font-sans">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Heading */}
          <div className="text-center space-y-2 mb-10 md:mb-12 mt-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Select Your Seller Pathway
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
              Choose the account structure that matches your listing frequency scale.
            </p>
          </div>

          {/* Pathway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Private Seller Card */}
            <div 
              onClick={isDealer ? null : onSelectPrivate}
              className={`flex flex-col h-full bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200/50 transition-all duration-300 shadow-sm relative ${
                isDealer ? 'opacity-50 cursor-not-allowed select-none' : 'hover:bg-[#F1F5F9] hover:border-amber-400 cursor-pointer hover:shadow-md group'
              }`}
            >
              {isDealer && (
                <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-200">
                  Disabled for Dealers
                </div>
              )}
              
              {/* Avatar Icon Wrapper */}
              <div className="w-14 h-14 rounded-2xl bg-[#FFC700] flex items-center justify-center mb-8 shadow-sm shadow-[#FFC700]/10">
                <User className="h-7 w-7 text-[#1A103C] fill-[#1A103C]" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                Private Seller
              </h3>
              
              <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                Selling your personal ride, spare parts, or single items. Fast chronological deployment profiles.
              </p>
              
              <div className={`flex items-center font-extrabold text-sm md:text-base mt-auto border-t border-slate-100 pt-6 ${
                isDealer ? 'text-slate-400' : 'text-slate-900 group-hover:text-amber-600'
              }`}>
                {isDealer ? 'Showroom Mode Active' : 'Go to Free Posting View'}
                {!isDealer && <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
              </div>
            </div>

            {/* Showroom Dealer Card */}
            <div 
              onClick={onSelectShowroom}
              className="flex flex-col h-full bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-3xl p-8 border border-slate-200/50 hover:border-slate-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group relative"
            >
              {/* Briefcase Icon Wrapper */}
              <div className="w-14 h-14 rounded-2xl bg-[#131517] flex items-center justify-center mb-8 shadow-sm shadow-[#131517]/10">
                <Briefcase className="h-7 w-7 text-[#B27D56] fill-[#B27D56]" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                Showroom Dealer
              </h3>
              
              <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                For registered importers, dealerships, and bulk trade wholesalers. Access corporate management tools.
              </p>
              
              <div className="flex items-center text-slate-900 font-extrabold text-sm md:text-base group-hover:text-slate-700 transition-colors mt-auto border-t border-slate-100 pt-6">
                View Showroom Membership Plans
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
