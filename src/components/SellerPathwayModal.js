import React from 'react';
import { User, Building2, X, ArrowRight } from 'lucide-react';

export default function SellerPathwayModal({ isDealer = false, onClose, onSelectPrivate, onSelectShowroom }) {

  return (
    <>
      {/* Main Pathway Modal Backdrop with responsive scroll */}
      <div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center transition-opacity duration-300">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-[32px] shadow-2xl p-5 sm:p-8 md:p-12 border border-slate-100 font-sans my-auto transition-all duration-300">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-full z-10"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Heading */}
          <div className="text-center space-y-1 sm:space-y-2 mb-6 sm:mb-10 md:mb-12 mt-2 sm:mt-4 pr-6 sm:pr-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Select Your Seller Pathway
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
              Choose the account structure that matches your listing frequency scale.
            </p>
          </div>

          {/* Pathway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            
            {/* Private Seller Card */}
            <div 
              onClick={isDealer ? null : onSelectPrivate}
              className={`flex flex-col h-full bg-[#F8FAFC] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/70 transition-all duration-300 shadow-sm relative ${
                isDealer ? 'opacity-50 cursor-not-allowed select-none' : 'hover:bg-amber-50/40 hover:border-amber-400 cursor-pointer hover:shadow-xl group'
              }`}
            >
              {isDealer && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-200">
                  Disabled for Dealers
                </div>
              )}
              
              {/* Avatar Icon Wrapper */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center mb-4 sm:mb-8 shadow-md shadow-amber-400/25 border border-amber-300/50 transition-transform duration-300 group-hover:scale-105">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-slate-950 stroke-[2.2]" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 sm:mb-3">
                Private Seller
              </h3>
              
              <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-8 flex-grow">
                Selling your personal ride, spare parts, or single items. Fast chronological deployment profiles.
              </p>
              
              <div className={`flex items-center font-extrabold text-xs sm:text-sm md:text-base mt-auto border-t border-slate-200/60 pt-4 sm:pt-6 ${
                isDealer ? 'text-slate-400' : 'text-slate-900 group-hover:text-amber-600'
              }`}>
                {isDealer ? 'Showroom Mode Active' : 'Go to Free Posting View'}
                {!isDealer && <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
              </div>
            </div>

            {/* Showroom Dealer Card */}
            <div 
              onClick={onSelectShowroom}
              className="flex flex-col h-full bg-[#F8FAFC] hover:bg-slate-900/[0.03] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/70 hover:border-slate-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl group relative"
            >
              {/* Showroom / Dealership Icon Wrapper */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex items-center justify-center mb-4 sm:mb-8 shadow-md shadow-slate-900/25 border border-amber-400/30 transition-transform duration-300 group-hover:scale-105">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400 stroke-[2.2]" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 sm:mb-3">
                Showroom Dealer
              </h3>
              
              <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-8 flex-grow">
                For registered importers, dealerships, and bulk trade wholesalers. Access corporate management tools.
              </p>
              
              <div className="flex items-center text-slate-900 font-extrabold text-xs sm:text-sm md:text-base group-hover:text-amber-600 transition-colors mt-auto border-t border-slate-200/60 pt-4 sm:pt-6">
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
