// BoostPostModal.js
import React, { useState } from 'react';
import { X, Check, Upload, Clipboard, AlertCircle, Sparkles, Pin, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { submitBoostPostRequest } from '../api/bikeApi';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './BoostPostModal.css';

const PACKAGES = [
  {
    id: 'pinned',
    title: '⭐ Pinned Top Ad Spot',
    badgeText: '7 Days Top Pin',
    badgeClass: 'pinned',
    price: 1500,
    priceFormatted: 'රු. 1,500',
    duration: '7 Days Duration',
    descriptionSi: 'දින 7ක් පුරා Category එකේ උඩින්ම Pin කර තබයි. වෙනත් ඇඩ් ආවත් යට යන්නේ නැත.',
    descriptionEn: 'Pins your ad at the top of its category for 7 days. Stays on top as new ads arrive.',
    icon: Pin,
  },
  {
    id: 'urgent',
    title: '🚨 Urgent Attention Tag',
    badgeText: '14 Days Badge',
    badgeClass: 'urgent',
    price: 500,
    priceFormatted: 'රු. 500',
    duration: '14 Days Duration',
    descriptionSi: 'ඉක්මනින් විකුණා ගැනීමට "Urgent" Badge එකක් සහ Highlight එකක් දින 14ක් පුරා ඇඩ් එකට යොදයි.',
    descriptionEn: 'Adds a bright Urgent badge & highlighted frame to sell your bike up to 5x faster.',
    icon: AlertTriangle,
  },
  {
    id: 'bump',
    title: '💥 Chronological Bump',
    badgeText: 'Page 1 Reset',
    badgeClass: 'bump',
    price: 300,
    priceFormatted: 'රු. 300',
    duration: 'Instant Top Boost',
    descriptionSi: 'ඇඩ් එක පරණ වෙලා යට යද්දී, නැවත පළමු පිටුවේ ඉහළටම (Page 1) ගෙන එයි.',
    descriptionEn: 'Instantly resets your ad timestamp bringing it back to the very top of Page 1.',
    icon: Sparkles,
  },
];

export default function BoostPostModal({ isOpen, onClose, vehicle }) {
  const [selectedPkgId, setSelectedPkgId] = useState('pinned');
  const [step, setStep] = useState(1); // 1: Package Selection, 2: Remittance, 3: Audit

  // Step 2 Form States
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const pendingRequest = vehicle?.boostRequests?.find(r => r.status === 'pending');

  React.useEffect(() => {
    if (isOpen) {
      if (pendingRequest) {
        setStep(3);
      } else {
        setStep(1);
      }
    }
  }, [isOpen, vehicle, pendingRequest]);

  if (!isOpen || !vehicle) return null;

  const selectedPkg = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[0];

  const handleCopyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size exceeds 10MB limit.');
        return;
      }
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
      setSubmitError('');
    }
  };

  const handleProceedToRemittance = () => {
    setStep(2);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      setSubmitError('Please upload a bank payment remittance slip.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('vehicleId', vehicle.id);
      formData.append('packageType', selectedPkg.id);
      formData.append('packageName', selectedPkg.title);
      formData.append('amount', selectedPkg.price);
      formData.append('slip', slipFile);

      await submitBoostPostRequest(formData);
      setStep(3);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit boost request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLKR = (val) => `රු. ${Number(val).toLocaleString('en-LK')}`;

  return (
    <div className="boost-modal-overlay">
      <div className="boost-modal-container">
        
        {/* Header */}
        <div className="boost-modal-header">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Private Seller Boost
            </div>
            <h3 className="text-xl font-black text-[#0B1530] tracking-tight">
              Boost Your Vehicle Listing
            </h3>
          </div>
          <button onClick={onClose} className="boost-modal-close-btn" aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Steps Bar */}
        <div className="boost-steps-bar">
          <span className={`boost-step-pill ${step === 1 ? 'active' : 'inactive'}`}>
            1. Select Package
          </span>
          <span>→</span>
          <span className={`boost-step-pill ${step === 2 ? 'active' : 'inactive'}`}>
            2. Remittance
          </span>
          <span>→</span>
          <span className={`boost-step-pill ${step === 3 ? 'active' : 'inactive'}`}>
            3. Audit & Verify
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">

          {/* Vehicle Snapshot preview */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            {vehicle.image ? (
              <img 
                src={resolveMediaUrl(vehicle.image)} 
                alt={vehicle.title} 
                className="w-16 h-14 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-14 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                Bike
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Target Vehicle Listing
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">
                {vehicle.title}
              </h4>
              <p className="text-xs font-bold text-amber-600">
                {vehicle.price ? formatLKR(vehicle.price) : 'Negotiable'} • {vehicle.location || 'Sri Lanka'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Select Boost Package */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-base font-extrabold text-[#0B1530]">
                  Choose Your Promotion Strategy
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  Select a boost package to gain maximum buyer visibility across BikeEka marketplace.
                </p>
              </div>

              <div className="space-y-3.5">
                {PACKAGES.map((pkg) => {
                  const Icon = pkg.icon;
                  const isSelected = selectedPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`boost-package-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#0B1530] text-amber-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-base font-black text-slate-900">
                                {pkg.title}
                              </h5>
                              <span className={`boost-package-badge ${pkg.badgeClass}`}>
                                {pkg.badgeText}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">
                              {pkg.duration}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-slate-900 block">
                            {pkg.priceFormatted}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 ml-auto mt-1 flex items-center justify-center ${
                            isSelected ? 'border-[#0B1530] bg-[#0B1530] text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100/80 text-xs space-y-1">
                        <p className="text-slate-700 font-bold leading-relaxed">
                          {pkg.descriptionSi}
                        </p>
                        <p className="text-slate-400 font-medium text-[11px]">
                          {pkg.descriptionEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleProceedToRemittance}
                className="w-full py-4 bg-[#0B1530] hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-slate-900/10"
              >
                Proceed to Bank Transfer →
              </button>
            </div>
          )}

          {/* STEP 2: Remittance Settlement */}
          {step === 2 && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-[#0B1530] tracking-tight">
                  Remittance Settlement
                </h4>
                <p className="text-xs text-slate-500 font-bold">
                  {selectedPkg.title} — <span className="text-amber-600 font-black">{selectedPkg.priceFormatted}</span>
                </p>
              </div>

              {/* Bank Account Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HNB */}
                <div className="bank-account-card">
                  <h5 className="text-xs font-black text-blue-700 uppercase tracking-wider">
                    Hatton National Bank (HNB)
                  </h5>
                  <div className="text-[11px] font-semibold text-slate-600 space-y-0.5">
                    <p><span className="text-slate-400">Branch:</span> Godakawela</p>
                    <p><span className="text-slate-400">Name:</span> CBU Perera</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-black uppercase text-slate-400">Acc No</span>
                      <span className="text-xs font-black text-slate-800">235020070454</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard('235020070454', 'hnb')}
                      className="bank-copy-btn"
                    >
                      {copySuccess === 'hnb' ? <Check className="h-3 w-3 text-green-700" /> : <Clipboard className="h-3 w-3" />}
                      {copySuccess === 'hnb' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* BOC */}
                <div className="bank-account-card">
                  <h5 className="text-xs font-black text-amber-700 uppercase tracking-wider">
                    Bank of Ceylon (BOC)
                  </h5>
                  <div className="text-[11px] font-semibold text-slate-600 space-y-0.5">
                    <p><span className="text-slate-400">Branch:</span> Rakwana</p>
                    <p><span className="text-slate-400">Name:</span> CBU Perera</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-black uppercase text-slate-400">Acc No</span>
                      <span className="text-xs font-black text-slate-800">95202502</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard('95202502', 'boc')}
                      className="bank-copy-btn"
                    >
                      {copySuccess === 'boc' ? <Check className="h-3 w-3 text-green-700" /> : <Clipboard className="h-3 w-3" />}
                      {copySuccess === 'boc' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Due Banner */}
              <div className="flex items-center justify-between bg-[#0B1530] text-white p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-300">Total Settlement Due:</span>
                <span className="text-xl font-black text-[#FFC700]">{selectedPkg.priceFormatted}</span>
              </div>

              {/* Bank Slip Upload Zone */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B1530]">
                  Upload Bank Transfer / Payment Slip *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-white rounded-2xl p-5 transition-all flex flex-col items-center justify-center cursor-pointer group min-h-[130px]">
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
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-800 truncate max-w-[220px]">
                          {slipFile?.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold">
                          {(slipFile?.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1 border border-green-200">
                          <Check className="h-2.5 w-2.5" /> Slip Attached Ready
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5 pointer-events-none">
                      <div className="w-10 h-10 bg-slate-200/60 group-hover:bg-[#0B1530] group-hover:text-white rounded-xl flex items-center justify-center mx-auto transition-colors text-slate-600">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-extrabold text-slate-700">
                        Click or drag bank transfer slip image here
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        Supports JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-[#0B1530] hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting Slip...
                    </>
                  ) : (
                    <>
                      Submit Bank Slip for Approval <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Audit & Pending Status */}
          {step === 3 && (
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                  Pending Admin Audit
                </div>
                <h4 className="text-xl font-black text-[#0B1530]">
                  {pendingRequest ? 'Boost Request Already Pending Approval' : 'Bank Slip Submitted Successfully!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {pendingRequest 
                    ? 'You have already submitted a bank slip for this listing. Our team is auditing your payment slip. Please wait for approval.'
                    : `Our verification team is auditing your bank slip. Once approved, your ad boost (${selectedPkg.title}) will activate immediately.`
                  }
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                <p><span className="font-bold text-slate-600">Selected Package:</span> {pendingRequest ? pendingRequest.packageName : selectedPkg.title}</p>
                <p><span className="font-bold text-slate-600">Amount Settled:</span> {pendingRequest ? `රු. ${Number(pendingRequest.amount).toLocaleString('en-LK')}` : selectedPkg.priceFormatted}</p>
                <p><span className="font-bold text-slate-600">Listing Title:</span> {vehicle.title}</p>
                <p><span className="font-bold text-slate-600">Verification Status:</span> <span className="text-amber-600 font-bold uppercase">Pending Slip Verification</span></p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-md mx-auto py-3.5 bg-[#0B1530] hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
              >
                Done / Close Window
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
