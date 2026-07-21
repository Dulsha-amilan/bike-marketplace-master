import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, X, Clipboard, Check, Upload, Clock } from 'lucide-react';
import { getMemberships, submitMembershipRequest, getMyPendingMembershipRequest, getMyApprovedMembershipRequest, updateMyApprovedMembershipRequest } from '../api/bikeApi';
import { useAuth } from './AuthContext';

export default function ShowroomMembershipsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedTier, setSelectedTier] = useState('plus'); // 'plus' or 'premium'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1); // 1: Details, 2: Remittance, 3: Audit

  // Step 1 Form States
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopImageFile, setShopImageFile] = useState(null);
  const [shopImagePreview, setShopImagePreview] = useState('');

  // Step 2 Form States
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [myPendingRequest, setMyPendingRequest] = useState(null);
  const [myApprovedRequest, setMyApprovedRequest] = useState(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editShopName, setEditShopName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);

  const handleOpenEditModal = () => {
    if (!myApprovedRequest) return;
    setEditShopName(myApprovedRequest.shopName || '');
    setEditPhone(myApprovedRequest.phone || '');
    setEditEmail(myApprovedRequest.email || '');
    setEditLogoPreview(myApprovedRequest.shopImage || null);
    setEditCoverPreview(myApprovedRequest.coverImage || null);
    setEditLogoFile(null);
    setEditCoverFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('shopName', editShopName);
      formData.append('phone', editPhone);
      formData.append('email', editEmail);
      if (editLogoFile) {
        formData.append('shopImage', editLogoFile);
      }
      if (editCoverFile) {
        formData.append('coverImage', editCoverFile);
      }

      const updatedRequest = await updateMyApprovedMembershipRequest(formData);
      setMyApprovedRequest(updatedRequest);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMemberships()
      .then((data) => {
        setPlans(data || []);
      })
      .catch((err) => {
        console.error('Error fetching memberships:', err);
        setError('Failed to load membership plans. Using fallback data.');
        // Fallback static data if backend is offline
        setPlans([
          {
            id: 1,
            tier: 'plus',
            planName: 'Monthly Plan',
            costPerAd: 350.00,
            inventoryCap: 20,
            monthlyVouchers: '1 Top Ad + 5 Bumps',
            discountText: null,
            totalCost: 7000.00,
            isBestValue: false
          },
          {
            id: 2,
            tier: 'plus',
            planName: 'Quarterly Plan',
            costPerAd: 332.50,
            inventoryCap: 20,
            monthlyVouchers: '4 Top Ads + 20 Bumps',
            discountText: 'Contract Discount Applied',
            totalCost: 19950.00,
            isBestValue: true
          },
          {
            id: 3,
            tier: 'plus',
            planName: 'Yearly Plan',
            costPerAd: 280.00,
            inventoryCap: 20,
            monthlyVouchers: '20 Top Ads + 100 Bumps',
            discountText: 'Maximum Savings Tier',
            totalCost: 67200.00,
            isBestValue: false
          },
          {
            id: 4,
            tier: 'premium',
            planName: 'Monthly Plan',
            costPerAd: 500.00,
            inventoryCap: 50,
            monthlyVouchers: '5 Top Ads + 15 Bumps',
            discountText: null,
            totalCost: 25000.00,
            isBestValue: false
          },
          {
            id: 5,
            tier: 'premium',
            planName: 'Quarterly Plan',
            costPerAd: 450.00,
            inventoryCap: 50,
            monthlyVouchers: '15 Top Ads + 45 Bumps',
            discountText: 'Premium Discount Applied',
            totalCost: 67500.00,
            isBestValue: true
          },
          {
            id: 6,
            tier: 'premium',
            planName: 'Yearly Plan',
            costPerAd: 400.00,
            inventoryCap: 50,
            monthlyVouchers: '60 Top Ads + 200 Bumps',
            discountText: 'Elite Savings Tier',
            totalCost: 240000.00,
            isBestValue: false
          }
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      alert('Access Denied: Administrators cannot purchase or register for Commercial Showroom Memberships.');
      navigate('/');
    } else if (isAuthenticated) {
      getMyPendingMembershipRequest()
        .then((data) => {
          if (data) {
            setMyPendingRequest(data);
          }
        })
        .catch((err) => {
          console.error('Error checking my pending request:', err);
        });

      getMyApprovedMembershipRequest()
        .then((data) => {
          if (data) {
            setMyApprovedRequest(data);
          }
        })
        .catch((err) => {
          console.error('Error checking my approved request:', err);
        });
    }
  }, [isAuthenticated, user, navigate]);

  const filteredPlans = plans.filter(p => p.tier === selectedTier);

  // Helper to format currency
  const formatLKR = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 'LKR 0' : `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      alert('Please log in to purchase a Showroom Membership plan.');
      navigate('/login');
      return;
    }

    if (myPendingRequest) {
      setSelectedPlan(myPendingRequest.membership);
      setShopName(myPendingRequest.shopName);
      setShopImagePreview(myPendingRequest.shopImage || '');
      setStep(3);
      setShowModal(true);
      return;
    }

    setSelectedPlan(plan);
    setShopName('');
    setEmail(user?.email || '');
    setPhone('');
    setSlipFile(null);
    setSlipPreview('');
    setShopImageFile(null);
    setShopImagePreview('');
    setSubmitError('');
    setStep(1);
    setShowModal(true);
  };

  const handleCopyToClipboard = (text, bankName) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(bankName);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShopImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShopImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!shopName || !email || !phone) {
      setSubmitError('All registry details are required.');
      return;
    }
    if (!shopImageFile) {
      setSubmitError('Please upload your shop logo or image.');
      return;
    }
    setSubmitError('');
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      setSubmitError('Please upload your bank transfer deposit slip to proceed.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('shopName', shopName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('membershipId', selectedPlan.id);
      formData.append('slip', slipFile);
      if (shopImageFile) {
        formData.append('shopImage', shopImageFile);
      }

      const res = await submitMembershipRequest(formData);
      if (res.request) {
        setMyPendingRequest({
          ...res.request,
          membership: selectedPlan
        });
      }
      setStep(3);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit registration request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 py-12 px-4 font-sans relative">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Heading */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B1530] tracking-tight">
            Commercial Showroom Memberships
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
            {myApprovedRequest 
              ? "Manage your active showroom dealership shop profile details and deploy listings."
              : "Unlock micro-pricing packages to scale your dealership footprint safely."}
          </p>
        </div>

        {/* Toggle Selector */}
        {!myApprovedRequest && (
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-[#F1F5F9] p-1.5 rounded-2xl border border-slate-200/50 shadow-sm">
              <button
                onClick={() => setSelectedTier('plus')}
                className={`px-8 py-3 text-sm font-extrabold rounded-xl transition-all duration-200 ${
                  selectedTier === 'plus'
                    ? 'bg-[#0B1530] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plus Tiers
              </button>
              <button
                onClick={() => setSelectedTier('premium')}
                className={`px-8 py-3 text-sm font-extrabold rounded-xl transition-all duration-200 ${
                  selectedTier === 'premium'
                    ? 'bg-[#0B1530] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Premium Tiers
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200/40 flex items-center gap-2 max-w-md mx-auto text-xs font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FFC700] rounded-full animate-spin" />
          </div>
        ) : myApprovedRequest ? (
          /* Showroom Shop Details Dashboard */
          <div className="max-w-2xl mx-auto bg-white rounded-[32px] border border-slate-200/60 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Shop Cover Banner */}
            <div className="h-44 w-full bg-slate-900 relative">
              {myApprovedRequest.coverImage ? (
                <img 
                  src={myApprovedRequest.coverImage} 
                  alt="Shop Cover Banner" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center text-slate-500 font-semibold text-xs">
                  No Cover Banner Uploaded
                </div>
              )}
            </div>

            <div className="p-8 md:p-10 space-y-8 mt-[-60px] relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                {myApprovedRequest.shopImage ? (
                  <img 
                    src={myApprovedRequest.shopImage} 
                    alt="Shop Logo" 
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-28 h-28 bg-[#0B1530] rounded-2xl flex items-center justify-center text-[#FFC700] font-black text-3xl border-4 border-white shadow-lg flex-shrink-0 animate-pulse">
                    {myApprovedRequest.shopName?.slice(0, 2).toUpperCase() || 'SR'}
                  </div>
                )}
                <div className="text-center sm:text-left space-y-2 mt-12 sm:mt-0">
                  <div className="inline-flex items-center gap-1.2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    <svg className="w-3 h-3 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified Showroom Shop
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1530] tracking-tight flex items-center justify-center sm:justify-start gap-2">
                    {myApprovedRequest.shopName}
                    <span className="inline-flex items-center justify-center bg-[#0084FF] text-white rounded-full p-0.5 w-5.5 h-5.5 flex-shrink-0 shadow-sm" title="Verified Showroom Partner">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-semibold">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Active Membership Plan</span>
                  <span className="block text-slate-800 text-base">{myApprovedRequest.membership?.planName || 'Custom Plan'}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Inventory Capacity Limit</span>
                  <span className="block text-slate-800 text-base">{myApprovedRequest.membership?.inventoryCap || 20} Active Ads</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Boost Vouchers</span>
                  <span className="block text-slate-800 text-base">{myApprovedRequest.membership?.monthlyVouchers || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Mobile Hotline</span>
                  <span className="block text-slate-800 text-base">+94 {myApprovedRequest.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</span>
                  <span className="block text-slate-800 text-base">{myApprovedRequest.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Registered On</span>
                  <span className="block text-slate-800 text-base">{new Date(myApprovedRequest.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleOpenEditModal}
                  className="py-4 px-6 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 text-center"
                >
                  Edit Shop Details
                </button>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="flex-grow py-4 bg-[#0B1530] hover:bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 text-center shadow-lg shadow-slate-900/10"
                >
                  Post Your Ad
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {filteredPlans.map(plan => {
              const isBest = !!plan.isBestValue;
              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between bg-white rounded-[32px] p-8 md:p-10 border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                    isBest 
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-lg z-10' 
                      : 'border-slate-200/80 shadow-sm'
                  }`}
                >
                  {/* Best Value Ribbon */}
                  {isBest && (
                    <div className="absolute top-0 right-0 overflow-hidden w-36 h-36 pointer-events-none">
                      <div className="absolute bg-[#FFC700] text-slate-950 font-black text-[10px] tracking-wider uppercase text-center py-1.5 w-[160px] top-[26px] right-[-44px] rotate-45 shadow-sm">
                        Best Value
                      </div>
                    </div>
                  )}

                  {/* Top Block */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#0B1530]">{plan.planName}</h2>
                    </div>

                    {/* Metric 1 */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Calculated Cost Per Ad
                      </span>
                      <span className="block text-lg font-bold text-slate-800">
                        {formatLKR(plan.costPerAd)}
                      </span>
                    </div>

                    {/* Metric 2 */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Active Inventory Cap
                      </span>
                      <span className="block text-lg font-bold text-slate-800">
                        {plan.inventoryCap} Active Listings
                      </span>
                    </div>

                    {/* Metric 3 */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Bundled Monthly Vouchers
                      </span>
                      <span className="block text-lg font-bold text-slate-800">
                        {plan.monthlyVouchers}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Block */}
                  <div className="space-y-6 mt-12">
                    {/* Badge Text */}
                    <div className="min-h-[20px]">
                      {plan.discountText ? (
                        <span className="text-xs font-bold text-slate-500">
                          {plan.discountText}
                        </span>
                      ) : null}
                    </div>

                    {/* Total Price */}
                    <div>
                      <span className="block text-3xl font-black text-[#0B1530]">
                        {formatLKR(plan.totalCost)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all duration-200 tracking-wide border ${
                        isBest
                          ? 'bg-[#1E293B] hover:bg-slate-900 text-white shadow-md shadow-slate-900/10'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      Select Plan
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MULTI-STEP PURCHASE REGISTRY MODAL --- */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-slate-100/80 max-h-[90vh] overflow-y-auto no-scrollbar font-sans" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Stepper Progress Indicator */}
            <div className="flex items-center justify-center gap-3 mb-8 text-xs font-extrabold text-slate-400">
              <span className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                step === 1 ? 'bg-[#0B1530] text-white shadow-md' : 'bg-slate-100 text-slate-500'
              }`}>
                1. Details
              </span>
              <span>→</span>
              <span className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                step === 2 ? 'bg-[#0B1530] text-white shadow-md' : 'bg-slate-100 text-slate-500'
              }`}>
                2. Remittance
              </span>
              <span>→</span>
              <span className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                step === 3 ? 'bg-[#0B1530] text-white shadow-md' : 'bg-slate-100 text-slate-500'
              }`}>
                3. Audit
              </span>
            </div>

            {/* ERROR ZONE */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200/50 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* STEP 1: Account Registry Details */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="text-center space-y-1 mb-8">
                  <h2 className="text-2xl font-black text-[#0B1530] tracking-tight">
                    Account Registry Details
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Target Item: {selectedPlan.planName}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                      Showroom / Dealer Shop Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g., Colombo Superbike Centre"
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                      Mobile Hotline
                    </label>
                    <div className="flex border border-slate-200 rounded-2xl overflow-hidden focus-within:border-slate-800 transition-colors">
                      <div className="bg-slate-50 border-r border-slate-200 px-4 py-4 text-slate-400 text-sm font-semibold flex items-center justify-center">
                        LK +94
                      </div>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="771234567"
                        className="flex-grow px-5 py-4 focus:outline-none text-slate-800 placeholder-slate-400 font-medium text-sm"
                      />
                    </div>
                  </div>

                  {/* Shop Image / Logo Upload */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                      Upload Shop Logo / Image *
                    </label>
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-800 bg-slate-50/50 hover:bg-white rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group min-h-[100px]">
                      <input 
                        type="file" 
                        required
                        accept="image/*"
                        onChange={handleShopImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {shopImagePreview ? (
                        <div className="flex items-center gap-4 w-full z-20">
                          <img 
                            src={shopImagePreview} 
                            alt="Logo Preview" 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-slate-700 truncate max-w-[200px]">
                              {shopImageFile?.name || 'Shop Logo / Image'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 border border-green-200">
                              <Check className="h-2 w-2" /> Logo Loaded
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 pointer-events-none">
                          <div className="w-8 h-8 bg-slate-200/50 group-hover:bg-slate-900 group-hover:text-white rounded-lg flex items-center justify-center mx-auto transition-colors text-slate-500">
                            <Upload className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-extrabold text-slate-600">
                            Click or drag logo image here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#0B1530] hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-slate-900/10 mt-8"
                >
                  Continue to Bank Transfer
                </button>
              </form>
            )}

            {/* STEP 2: Remittance Settlement */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="text-center space-y-1 mb-8">
                  <h2 className="text-2xl font-black text-[#0B1530] tracking-tight">
                    Remittance Settlement
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {selectedPlan.planName} — {formatLKR(selectedPlan.totalCost)}
                  </p>
                </div>

                {/* Bank account details row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Account 1 */}
                  <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider">
                      Hatton National Bank
                    </h4>
                    <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                      <p><span className="text-slate-400 font-medium">Branch:</span> Godakawela</p>
                      <p><span className="text-slate-400 font-medium">Name:</span> CBU Perera</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Acc No</span>
                        <span className="text-xs font-bold text-slate-700">235020070454</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard('235020070454', 'hnb')}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-slate-900 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                      >
                        {copySuccess === 'hnb' ? <Check className="h-3 w-3 text-green-700" /> : <Clipboard className="h-3 w-3" />}
                        {copySuccess === 'hnb' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Account 2 */}
                  <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Bank of Ceylon
                    </h4>
                    <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                      <p><span className="text-slate-400 font-medium">Branch:</span> Rakwana</p>
                      <p><span className="text-slate-400 font-medium">Name:</span> CBU Perera</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Acc No</span>
                        <span className="text-xs font-bold text-slate-700">95202502</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard('95202502', 'boc')}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-slate-900 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                      >
                        {copySuccess === 'boc' ? <Check className="h-3 w-3 text-green-700" /> : <Clipboard className="h-3 w-3" />}
                        {copySuccess === 'boc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Total due block */}
                <div className="w-full flex items-center justify-between bg-[#131517] text-white p-5 rounded-2xl">
                  <span className="text-sm font-semibold text-slate-400">Total Due:</span>
                  <span className="text-xl font-black text-[#FFC700]">{formatLKR(selectedPlan.totalCost)}</span>
                </div>

                {/* Slip Upload Zone */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                    Upload Bank Remittance Slip *
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-800 bg-slate-50/50 hover:bg-white rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group min-h-[140px]">
                    <input 
                      type="file" 
                      required
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    
                    {slipPreview ? (
                      <div className="flex items-center gap-4 w-full z-20">
                        <img 
                          src={slipPreview} 
                          alt="Slip Preview" 
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                        />
                        <div className="text-left">
                          <span className="block text-xs font-bold text-slate-700 truncate max-w-[200px]">
                            {slipFile?.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            {(slipFile?.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 border border-green-200">
                            <Check className="h-2 w-2" /> File Loaded
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 pointer-events-none">
                        <div className="w-10 h-10 bg-slate-200/50 group-hover:bg-slate-900 group-hover:text-white rounded-xl flex items-center justify-center mx-auto transition-colors text-slate-500">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-600">
                          Drag slip image here or click to browse
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          Supports PNG, JPG, JPEG up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#0B1530] hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <span>✓ 2. Payment Completed & Submit</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Auditing Portal Remittance Logs */}
            {step === 3 && (
              <div className="space-y-8 text-center py-6">
                
                {/* Circular Loading Spinner */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-[#FFC700] rounded-full animate-spin" />
                  <Clock className="h-8 w-8 text-[#0B1530]" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-[#0B1530] tracking-tight">
                    Auditing Portal Remittance Logs...
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                    Our system panel is reconciling core incoming ledger transactions across live banking systems.
                  </p>
                </div>

                {/* Audit Grid/Table */}
                <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-3xl p-6 text-left max-w-sm mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Target Holder:</span>
                    <span className="font-bold text-slate-800">{shopName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-400">Target Asset:</span>
                    <span className="font-bold text-slate-800">
                      {selectedPlan.planName} ({formatLKR(selectedPlan.totalCost)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-400">Status Code:</span>
                    <span className="font-bold text-[#D97706] bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#FDE68A]/60">
                      Pending Slip Verification
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-[#0B1530] hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md"
                >
                  Got It
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Edit Shop Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 border border-slate-100 overflow-y-auto max-h-[90vh] text-left">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-extrabold text-[#0B1530] mb-6">Edit Shop Profile</h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-5 font-sans">
              {/* Shop Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Name</label>
                <input
                  type="text"
                  required
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-[#0B1530]/10"
                />
              </div>

              {/* Hotline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hotline / Phone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-[#0B1530]/10"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={editEmail}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed rounded-2xl p-3 text-sm font-semibold focus:outline-none"
                />
              </div>

              {/* Logo Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Logo / Profile Photo</label>
                <div className="flex items-center gap-4">
                  {editLogoPreview ? (
                    <img src={editLogoPreview} alt="Logo Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-lg">SR</div>
                  )}
                  <label className="flex-grow py-3 px-4 border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 cursor-pointer text-center text-xs font-semibold text-slate-600 transition-all">
                    Choose Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditLogoFile(file);
                          setEditLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Banner Photo</label>
                <div className="space-y-3">
                  {editCoverPreview ? (
                    <img src={editCoverPreview} alt="Cover Preview" className="w-full h-24 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold">No Cover Banner Selected</div>
                  )}
                  <label className="block w-full py-3 border border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 cursor-pointer text-center text-xs font-semibold text-slate-600 transition-all">
                    Choose Cover Banner
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditCoverFile(file);
                          setEditCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#0B1530] hover:bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
