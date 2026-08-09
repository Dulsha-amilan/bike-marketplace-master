import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Bike, Trash2, Plus, X, 
  LayoutDashboard, AlertCircle, 
  CheckCircle, ArrowLeft, RefreshCw, UserCheck, Check, Ban, Pencil, Upload,
  CreditCard, Sparkles, Presentation, Eye
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { 
  getAdminVehicles, deleteVehicle, getSpareParts, getBikerGear,
  getAdminUsers, updateUserRole, deleteUser,
  createSparePart, deleteSparePart, createBikerGear, deleteBikerGear,
  updateVehicleStatus, updateAdminVehicle, uploadImage, deleteAllVehicles, getAdminStorageUpgrades,
  updateStorageUpgradeRequest,
  getMemberships, createMembership, updateMembership, deleteMembership,
  getMembershipRequests, updateMembershipRequestStatus,
  getAdminBoostRequests, updateBoostRequestStatus,
  getAdminAdBanners, updateAdBanner
} from '../api/bikeApi';
import { LeaderboardAdBanner, SkyscraperAdBanner, SquareBoxAdBanner } from './AdBannerComponents';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [bikerGear, setBikerGear] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [boostRequests, setBoostRequests] = useState([]);
  const [adBanners, setAdBanners] = useState({
    header_leaderboard: {
      slotId: 'header_leaderboard',
      name: 'Top Header Leaderboard (970x90)',
      dimensions: '970x90',
      badgeText: '🔥 MEGA SALE',
      title: 'UPGRADE YOUR RIDE TODAY!',
      subtitle: 'Get up to 30% off genuine motorcycle parts & riding gear.',
      buttonText: 'Shop Now →',
      linkUrl: '/spares',
      imageUrl: '',
      isEnabled: true,
    },
    side_skyscraper: {
      slotId: 'side_skyscraper',
      name: 'Side Skyscraper Banner (160x600)',
      dimensions: '160x600',
      badgeText: 'AD • SKYSCRAPER (160X600)',
      title: 'BIKE LEASING & FINANCE',
      subtitle: 'Same day approval with minimum documentation.',
      highlightText: 'RATES FROM 11.5%',
      buttonText: 'APPLY NOW',
      footerText: 'Terms & conditions apply',
      linkUrl: '/showroom-memberships',
      imageUrl: '',
      isEnabled: true,
    },
    square_box: {
      slotId: 'square_box',
      name: 'Square Box Banner (250x250)',
      dimensions: '250x250',
      badgeText: 'NEW',
      title: 'Certified Pre-Owned Guarantee',
      subtitle: 'Multi-point inspection on all verified dealer bikes.',
      buttonText: 'BROWSE VERIFIED',
      linkUrl: '/all',
      imageUrl: '',
      isEnabled: true,
    },
  });
  const [uploadingAdSlot, setUploadingAdSlot] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showSparePartModal, setShowSparePartModal] = useState(false);
  const [showBikerGearModal, setShowBikerGearModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isEditingMembership, setIsEditingMembership] = useState(false);
  const [currentMembershipId, setCurrentMembershipId] = useState(null);

  // Vehicle Edit Modal State
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [vehicleEditForm, setVehicleEditForm] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    condition: 'used',
    location: '',
    mileageKm: '',
    engineCapacityCc: '',
    fuelType: '',
    transmission: '',
    approvalStatus: 'approved',
    image: '',
    gallery: [],
    description: ''
  });

  // Form states
  const [membershipForm, setMembershipForm] = useState({
    tier: 'plus',
    planName: '',
    costPerAd: '',
    inventoryCap: '',
    monthlyVouchers: '',
    discountText: '',
    totalCost: '',
    isBestValue: false
  });

  // Search/Filter state
  const [userSearch, setUserSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Spare Part Form State
  const [sparePartForm, setSparePartForm] = useState({
    name: '',
    category: 'Engine Parts',
    brand: '',
    compatibility: '',
    condition: 'New',
    price: '',
    location: 'Colombo',
    image: ''
  });

  // Biker Gear Form State
  const [bikerGearForm, setBikerGearForm] = useState({
    name: '',
    category: 'Helmets',
    subCategory: 'Full Face',
    brand: '',
    size: 'M',
    condition: 'New',
    price: '',
    location: 'Colombo',
    rating: 5,
    verifiedSeller: true,
    image: ''
  });

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/admin-login');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Load all dashboard data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vehiclesData, sparePartsData, bikerGearData, usersData, upgradesData, membershipsData, requestsData, boostRequestsData, adsData] = await Promise.all([
        getAdminVehicles(),
        getSpareParts(),
        getBikerGear(),
        getAdminUsers(),
        getAdminStorageUpgrades(),
        getMemberships(),
        getMembershipRequests(),
        getAdminBoostRequests(),
        getAdminAdBanners().catch(() => [])
      ]);
      setVehicles(vehiclesData || []);
      setSpareParts(sparePartsData || []);
      setBikerGear(bikerGearData || []);
      setUsers(usersData || []);
      setUpgrades(upgradesData || []);
      setMemberships(membershipsData || []);
      setMembershipRequests(requestsData || []);
      setBoostRequests(boostRequestsData || []);

      if (Array.isArray(adsData) && adsData.length > 0) {
        setAdBanners(prev => {
          const updated = { ...prev };
          adsData.forEach(ad => {
            if (ad && ad.slotId) {
              updated[ad.slotId] = { ...prev[ad.slotId], ...ad };
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Ad Banner Manager Handlers
  const handleAdFieldChange = (slotId, field, value) => {
    setAdBanners(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        [field]: value
      }
    }));
  };

  const handleToggleAdStatus = async (slotId, isEnabled) => {
    handleAdFieldChange(slotId, 'isEnabled', isEnabled);
    try {
      const payload = { ...adBanners[slotId], isEnabled };
      await updateAdBanner(slotId, payload);
      showToast(`${adBanners[slotId]?.name || slotId} is now ${isEnabled ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update ad status.', false);
    }
  };

  const handleAdImageUpload = async (slotId, file) => {
    if (!file) return;
    setUploadingAdSlot(slotId);
    try {
      const res = await uploadImage(file);
      const uploadedUrl = res.url || res.imageUrl;
      if (uploadedUrl) {
        handleAdFieldChange(slotId, 'imageUrl', uploadedUrl);
        showToast(`Image uploaded successfully for ${adBanners[slotId]?.name || slotId}.`);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to upload ad banner image.', false);
    } finally {
      setUploadingAdSlot(null);
    }
  };

  const handleSaveAdBanner = async (slotId) => {
    setActionLoading(true);
    try {
      const payload = adBanners[slotId];
      await updateAdBanner(slotId, payload);
      showToast(`${payload.name} saved successfully.`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save ad banner configuration.', false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetAdBanner = async (slotId) => {
    const defaultsMap = {
      header_leaderboard: {
        slotId: 'header_leaderboard',
        name: 'Top Header Leaderboard (970x90)',
        dimensions: '970x90',
        badgeText: '🔥 MEGA SALE',
        title: 'UPGRADE YOUR RIDE TODAY!',
        subtitle: 'Get up to 30% off genuine motorcycle parts & riding gear.',
        buttonText: 'Shop Now →',
        linkUrl: '/spares',
        imageUrl: '',
        isEnabled: true,
      },
      side_skyscraper: {
        slotId: 'side_skyscraper',
        name: 'Side Skyscraper Banner (160x600)',
        dimensions: '160x600',
        badgeText: 'AD • SKYSCRAPER (160X600)',
        title: 'BIKE LEASING & FINANCE',
        subtitle: 'Same day approval with minimum documentation.',
        highlightText: 'RATES FROM 11.5%',
        buttonText: 'APPLY NOW',
        footerText: 'Terms & conditions apply',
        linkUrl: '/showroom-memberships',
        imageUrl: '',
        isEnabled: true,
      },
      square_box: {
        slotId: 'square_box',
        name: 'Square Box Banner (250x250)',
        dimensions: '250x250',
        badgeText: 'NEW',
        title: 'Certified Pre-Owned Guarantee',
        subtitle: 'Multi-point inspection on all verified dealer bikes.',
        buttonText: 'BROWSE VERIFIED',
        linkUrl: '/all',
        imageUrl: '',
        isEnabled: true,
      },
    };

    const defaultConfig = defaultsMap[slotId];
    if (!defaultConfig) return;

    setActionLoading(true);
    try {
      await updateAdBanner(slotId, defaultConfig);
      setAdBanners(prev => ({
        ...prev,
        [slotId]: defaultConfig
      }));
      showToast(`${defaultConfig.name} reset to initial default design.`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to reset ad banner.', false);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, user]);

  const showToast = (message, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Toggle user role between user and admin
  const handleToggleRole = async (userId, currentRole) => {
    if (userId === user.id) {
      showToast('You cannot revoke your own admin rights.', false);
      return;
    }

    setActionLoading(true);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`User role updated to ${newRole} successfully.`);
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showToast('You cannot delete your own account.', false);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      showToast('User account successfully deleted.');
    } catch (err) {
      showToast(err.message || 'Failed to delete user account.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete vehicle listing
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle listing?')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      showToast('Vehicle listing deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete vehicle listing.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Approve or reject vehicle listing
  const handleUpdateVehicleStatus = async (vehicleId, status) => {
    setActionLoading(true);
    try {
      await updateVehicleStatus(vehicleId, status);
      setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, approvalStatus: status } : v));
      showToast(`Vehicle listing status updated to ${status}.`);
    } catch (err) {
      showToast(err.message || 'Failed to update vehicle status.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Vehicle Edit Modal
  const handleOpenVehicleEdit = (v) => {
    let parsedGallery = [];
    if (Array.isArray(v.gallery)) {
      parsedGallery = v.gallery;
    } else if (typeof v.gallery === 'string' && v.gallery.trim()) {
      try {
        parsedGallery = JSON.parse(v.gallery);
      } catch (_) {
        parsedGallery = [];
      }
    }

    setEditingVehicleId(v.id);
    setVehicleEditForm({
      make: v.make || '',
      model: v.model || '',
      year: v.year || '',
      price: v.price !== null && v.price !== undefined ? v.price : '',
      condition: v.condition || 'used',
      location: v.location || '',
      mileageKm: v.mileageKm || '',
      engineCapacityCc: v.engineCapacityCc || v.engineCc || '',
      fuelType: v.fuelType || '',
      transmission: v.transmission || '',
      approvalStatus: v.approvalStatus || 'approved',
      image: v.image || '',
      gallery: parsedGallery,
      description: v.description || ''
    });
    setShowVehicleEditModal(true);
  };

  // Handle Main Image File Upload
  const handleMainFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadingMainImage(true);
    try {
      const res = await uploadImage(file);
      if (res && res.url) {
        setVehicleEditForm(prev => ({ ...prev, image: res.url }));
        showToast('Main display image uploaded successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload image.', false);
    } finally {
      setUploadingMainImage(false);
    }
  };

  // Handle Gallery Image File Upload
  const handleGalleryFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadingGalleryImage(true);
    try {
      const res = await uploadImage(file);
      if (res && res.url) {
        setVehicleEditForm(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), res.url]
        }));
        showToast('Gallery image uploaded successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload gallery photo.', false);
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  // Remove Gallery Image by index
  const handleRemoveGalleryImage = (index) => {
    setVehicleEditForm(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== index)
    }));
  };

  // Save Vehicle Edit
  const handleSaveVehicleEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await updateAdminVehicle(editingVehicleId, vehicleEditForm);
      const updated = res.vehicle || res;
      setVehicles(vehicles.map(v => v.id === editingVehicleId ? { ...v, ...updated } : v));
      showToast('Vehicle post updated successfully!');
      setShowVehicleEditModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update vehicle post.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle storage upgrade approval/rejection
  const handleUpdateUpgradeRequest = async (requestId, status) => {
    setActionLoading(true);
    try {
      await updateStorageUpgradeRequest(requestId, status);
      setUpgrades(upgrades.map(req => req.id === requestId ? { ...req, status } : req));
      showToast(`Storage upgrade request successfully ${status}.`);
    } catch (err) {
      showToast(err.message || 'Failed to update storage upgrade request.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle showroom dealer membership request approval/rejection
  const handleUpdateMembershipRequest = async (requestId, status) => {
    setActionLoading(true);
    try {
      await updateMembershipRequestStatus(requestId, status);
      setMembershipRequests(membershipRequests.map(req => req.id === requestId ? { ...req, status } : req));
      showToast(`Membership request successfully ${status}.`);
      
      // Reload users to reflect any updated role
      const usersData = await getAdminUsers();
      setUsers(usersData || []);
    } catch (err) {
      showToast(err.message || 'Failed to update membership request.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Membership Plan
  const handleAddMembership = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...membershipForm,
        costPerAd: parseFloat(membershipForm.costPerAd),
        inventoryCap: parseInt(membershipForm.inventoryCap, 10),
        totalCost: parseFloat(membershipForm.totalCost),
      };
      const res = await createMembership(payload);
      setMemberships([...memberships, res.membership]);
      setShowMembershipModal(false);
      setMembershipForm({
        tier: 'plus',
        planName: '',
        costPerAd: '',
        inventoryCap: '',
        monthlyVouchers: '',
        discountText: '',
        totalCost: '',
        isBestValue: false
      });
      showToast('Membership plan created successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to create membership plan.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Boost Post Request Status (Admin Approve / Reject)
  const handleUpdateBoostRequest = async (requestId, newStatus) => {
    setActionLoading(true);
    try {
      await updateBoostRequestStatus(requestId, newStatus);
      setBoostRequests(boostRequests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      showToast(`Boost request ${newStatus} successfully!`);
      // Reload vehicles data so any updated boost properties are reflected
      const updatedVehicles = await getAdminVehicles();
      setVehicles(updatedVehicles || []);
    } catch (err) {
      showToast(err.message || 'Failed to update boost request status.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Membership Plan
  const handleEditMembership = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...membershipForm,
        costPerAd: parseFloat(membershipForm.costPerAd),
        inventoryCap: parseInt(membershipForm.inventoryCap, 10),
        totalCost: parseFloat(membershipForm.totalCost),
      };
      const res = await updateMembership(currentMembershipId, payload);
      setMemberships(memberships.map(m => m.id === currentMembershipId ? res.membership : m));
      setShowMembershipModal(false);
      setIsEditingMembership(false);
      setCurrentMembershipId(null);
      setMembershipForm({
        tier: 'plus',
        planName: '',
        costPerAd: '',
        inventoryCap: '',
        monthlyVouchers: '',
        discountText: '',
        totalCost: '',
        isBestValue: false
      });
      showToast('Membership plan updated successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update membership plan.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Membership Plan
  const handleDeleteMembership = async (membershipId) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteMembership(membershipId);
      setMemberships(memberships.filter(m => m.id !== membershipId));
      showToast('Membership plan deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete membership plan.', false);
    } finally {
      setActionLoading(false);
    }
  };

  const openAddMembershipModal = () => {
    setIsEditingMembership(false);
    setMembershipForm({
      tier: 'plus',
      planName: '',
      costPerAd: '',
      inventoryCap: '',
      monthlyVouchers: '',
      discountText: '',
      totalCost: '',
      isBestValue: false
    });
    setShowMembershipModal(true);
  };

  const openEditMembershipModal = (membership) => {
    setIsEditingMembership(true);
    setCurrentMembershipId(membership.id);
    setMembershipForm({
      tier: membership.tier,
      planName: membership.planName,
      costPerAd: membership.costPerAd,
      inventoryCap: membership.inventoryCap,
      monthlyVouchers: membership.monthlyVouchers,
      discountText: membership.discountText || '',
      totalCost: membership.totalCost,
      isBestValue: !!membership.isBestValue
    });
    setShowMembershipModal(true);
  };

  // Delete all vehicle listings
  const handleDeleteAllVehicles = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL vehicle listings from the database? This action is irreversible.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteAllVehicles();
      setVehicles([]);
      showToast('All vehicle listings deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete all vehicle listings.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Spare Part
  const handleAddSparePart = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...sparePartForm,
        image: sparePartForm.image.trim() || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400'
      };
      const newPart = await createSparePart(payload);
      setSpareParts([newPart, ...spareParts]);
      setShowSparePartModal(false);
      setSparePartForm({
        name: '',
        category: 'Engine Parts',
        brand: '',
        compatibility: '',
        condition: 'New',
        price: '',
        location: 'Colombo',
        image: ''
      });
      showToast('Spare part added successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to add spare part.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Spare Part
  const handleDeleteSparePart = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this spare part listing?')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteSparePart(partId);
      setSpareParts(spareParts.filter(p => p.id !== partId));
      showToast('Spare part listing deleted.');
    } catch (err) {
      showToast(err.message || 'Failed to delete spare part.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Biker Gear
  const handleAddBikerGear = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...bikerGearForm,
        image: bikerGearForm.image.trim() || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'
      };
      const newGear = await createBikerGear(payload);
      setBikerGear([newGear, ...bikerGear]);
      setShowBikerGearModal(false);
      setBikerGearForm({
        name: '',
        category: 'Helmets',
        subCategory: 'Full Face',
        brand: '',
        size: 'M',
        condition: 'New',
        price: '',
        location: 'Colombo',
        rating: 5,
        verifiedSeller: true,
        image: ''
      });
      showToast('Biker gear item added successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to add biker gear.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Biker Gear
  const handleDeleteBikerGear = async (gearId) => {
    if (!window.confirm('Are you sure you want to delete this biker gear item?')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteBikerGear(gearId);
      setBikerGear(bikerGear.filter(g => g.id !== gearId));
      showToast('Biker gear listing deleted.');
    } catch (err) {
      showToast(err.message || 'Failed to delete biker gear.', false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filters search results
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    (v.make + ' ' + v.model)?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.id?.toString().toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      {/* Toast notifications */}
      {error && (
        <div className="admin-toast toast-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="admin-toast toast-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="admin-dashboard-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-profile-section">
            <div className="admin-avatar-large">
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <h3 className="admin-profile-name">{user?.name}</h3>
              <span className="admin-profile-tag">System Administrator</span>
            </div>
          </div>

          <nav className="admin-menu">
            <button 
              className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>Manage Users</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              <Bike size={18} />
              <span>Manage Vehicles</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'memberships' ? 'active' : ''}`}
              onClick={() => setActiveTab('memberships')}
            >
              <CreditCard size={18} />
              <span>Manage Memberships</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'membershipRequests' ? 'active' : ''}`}
              onClick={() => setActiveTab('membershipRequests')}
            >
              <CheckCircle size={18} />
              <span>Membership Requests</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'boostRequests' ? 'active' : ''}`}
              onClick={() => setActiveTab('boostRequests')}
            >
              <Sparkles size={18} />
              <span>Boost Post Approvals</span>
              {boostRequests.filter(r => r.status === 'pending').length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {boostRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'adManager' ? 'active' : ''}`}
              onClick={() => setActiveTab('adManager')}
            >
              <Presentation size={18} />
              <span>Ad Manager</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <button className="back-marketplace-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              <span>Marketplace</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {/* Header */}
          <header className="admin-main-header">
            <div className="admin-header-title">
              <h2>Admin Command Center</h2>
              <p>System metrics & resource management</p>
            </div>
            <button className="admin-refresh-btn" onClick={loadData} disabled={actionLoading}>
              <RefreshCw size={16} className={actionLoading ? 'spinning' : ''} />
              <span>Reload Data</span>
            </button>
          </header>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="admin-tab-content fade-in">
              {/* Analytics Grid */}
              <div className="admin-analytics-grid">
                <div className="analytics-card" onClick={() => setActiveTab('users')}>
                  <div className="analytics-icon-wrapper users-accent">
                    <Users size={24} />
                  </div>
                  <div className="analytics-details">
                    <span className="analytics-value">{users.length}</span>
                    <span className="analytics-label">Total Users</span>
                  </div>
                </div>

                <div className="analytics-card" onClick={() => setActiveTab('vehicles')}>
                  <div className="analytics-icon-wrapper vehicles-accent">
                    <Bike size={24} />
                  </div>
                  <div className="analytics-details">
                    <span className="analytics-value">{vehicles.length}</span>
                    <span className="analytics-label">Active Listings</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity lists */}
              <div className="admin-activity-panels">
                <div className="activity-panel">
                  <div className="panel-header">
                    <h3>Recent User Signups</h3>
                    <button className="panel-header-link" onClick={() => setActiveTab('users')}>View All</button>
                  </div>
                  <div className="panel-body">
                    {users.slice(0, 5).map(u => (
                      <div className="panel-list-item" key={u.id}>
                        <div className="panel-item-avatar">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="panel-item-info">
                          <span className="info-primary">{u.name}</span>
                          <span className="info-secondary">{u.email}</span>
                        </div>
                        <span className={`badge-role ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="activity-panel">
                  <div className="panel-header">
                    <h3>Recent Vehicle Listings</h3>
                    <button className="panel-header-link" onClick={() => setActiveTab('vehicles')}>View All</button>
                  </div>
                  <div className="panel-body">
                    {vehicles.slice(0, 5).map(v => (
                      <div className="panel-list-item" key={v.id}>
                        <img className="panel-item-img" src={v.image || 'https://via.placeholder.com/60'} alt={v.make} />
                        <div className="panel-item-info">
                          <span className="info-primary">{v.make} {v.model}</span>
                          <span className="info-secondary">{v.year} • LKR {v.price?.toLocaleString()}</span>
                        </div>
                        <span className={`badge-source ${v.source === 'system' ? 'badge-sys' : 'badge-usr'}`}>
                          {v.source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Storage Upgrades */}
          {activeTab === 'upgrades' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls">
                <div className="search-bar-wrapper">
                  <h3 className="text-lg font-bold text-foreground">Storage Upgrade Requests</h3>
                  <p className="text-xs text-muted-foreground">Approve or reject requests from users to expand their upload limit to 10 photos.</p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Created At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upgrades.length > 0 ? (
                      upgrades.map(r => (
                        <tr key={r.id}>
                          <td className="text-small font-mono">{r.id}</td>
                          <td className="font-bold">{r.user?.name || 'Unknown User'}</td>
                          <td>{r.user?.email || 'N/A'}</td>
                          <td>{r.user?.phone || 'N/A'}</td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge-status badge-status-${r.status || 'pending'}`}>
                              {r.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions-cell">
                              {r.status === 'pending' && (
                                <>
                                  <button 
                                    className="action-btn-approve"
                                    onClick={() => handleUpdateUpgradeRequest(r.id, 'approved')}
                                    disabled={actionLoading}
                                    title="Approve Request"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    className="action-btn-reject"
                                    onClick={() => handleUpdateUpgradeRequest(r.id, 'rejected')}
                                    disabled={actionLoading}
                                    title="Reject Request"
                                  >
                                    <Ban size={16} />
                                  </button>
                                </>
                              )}
                              {r.status !== 'pending' && (
                                <span className="text-xs text-muted-foreground font-semibold px-2">Processed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="table-empty-row">No storage upgrade requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Users Management */}
          {activeTab === 'users' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls">
                <div className="search-bar-wrapper">
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td className="font-bold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge-role ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-actions-cell">
                              <button 
                                className={`action-btn-role ${u.id === user.id ? 'btn-disabled' : ''}`}
                                onClick={() => handleToggleRole(u.id, u.role)}
                                disabled={actionLoading || u.id === user.id}
                                title="Toggle user / admin role"
                              >
                                <UserCheck size={16} />
                                <span>Role</span>
                              </button>
                              <button 
                                className={`action-btn-delete ${u.id === user.id ? 'btn-disabled' : ''}`}
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={actionLoading || u.id === user.id}
                                title="Delete User Account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="table-empty-row">No users found matching query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Vehicles Management */}
          {activeTab === 'vehicles' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls justify-between">
                <div className="search-bar-wrapper" style={{ flexGrow: 1, maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    placeholder="Search listings by make, model or ID..." 
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                </div>
                {vehicles.length > 0 && (
                  <button 
                    className="admin-btn-danger"
                    onClick={handleDeleteAllVehicles}
                    disabled={actionLoading}
                  >
                    <Trash2 size={16} />
                    <span>Delete All Listings</span>
                  </button>
                )}
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Vehicle ID</th>
                      <th>Image</th>
                      <th>Make & Model</th>
                      <th>Year</th>
                      <th>Price</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Posted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map(v => (
                        <tr key={v.id}>
                          <td className="text-small font-mono">{v.id}</td>
                          <td>
                            <img className="table-row-img" src={v.image || 'https://via.placeholder.com/60'} alt={v.make} />
                          </td>
                          <td className="font-bold">{v.make} {v.model}</td>
                          <td>{v.year}</td>
                          <td>LKR {v.price ? v.price.toLocaleString() : 'Negotiable'}</td>
                          <td>
                            <span className={`badge-cond ${v.condition === 'new' ? 'badge-new' : 'badge-used'}`}>
                              {v.condition || 'used'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status badge-status-${v.approvalStatus || 'pending'}`}>
                              {v.approvalStatus || 'pending'}
                            </span>
                          </td>
                          <td>{new Date(v.postedAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-actions-cell">
                              {/* Edit Button */}
                              <button 
                                className="action-btn-role"
                                onClick={() => handleOpenVehicleEdit(v)}
                                disabled={actionLoading}
                                title="Edit vehicle post"
                              >
                                <Pencil size={16} />
                              </button>
                              {/* Approve Button */}
                              {(v.approvalStatus === 'pending' || v.approvalStatus === 'rejected') && (
                                <button 
                                  className="action-btn-approve"
                                  onClick={() => handleUpdateVehicleStatus(v.id, 'approved')}
                                  disabled={actionLoading}
                                  title="Approve post"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              {/* Reject Button */}
                              {(v.approvalStatus === 'pending' || v.approvalStatus === 'approved') && (
                                <button 
                                  className="action-btn-reject"
                                  onClick={() => handleUpdateVehicleStatus(v.id, 'rejected')}
                                  disabled={actionLoading}
                                  title="Reject post"
                                >
                                  <Ban size={16} />
                                </button>
                              )}
                              {/* Delete Button */}
                              <button 
                                className="action-btn-delete"
                                onClick={() => handleDeleteVehicle(v.id)}
                                disabled={actionLoading}
                                title="Delete listing permanently"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="table-empty-row">No vehicle listings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Spare Parts Management */}
          {activeTab === 'spareParts' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls justify-between">
                <h3>System Spare Parts Database ({spareParts.length})</h3>
                <button className="admin-btn-primary" onClick={() => setShowSparePartModal(true)}>
                  <Plus size={16} />
                  <span>Add Spare Part</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Compatibility</th>
                      <th>Condition</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spareParts.length > 0 ? (
                      spareParts.map(p => (
                        <tr key={p.id}>
                          <td>#{p.id}</td>
                          <td>
                            <img className="table-row-img" src={p.image || 'https://via.placeholder.com/60'} alt={p.name} />
                          </td>
                          <td className="font-bold">{p.name}</td>
                          <td>{p.category}</td>
                          <td>{p.brand || 'N/A'}</td>
                          <td>{p.compatibility || 'Generic'}</td>
                          <td>
                            <span className={`badge-cond ${p.condition === 'New' ? 'badge-new' : 'badge-used'}`}>
                              {p.condition}
                            </span>
                          </td>
                          <td>LKR {p.price.toLocaleString()}</td>
                          <td>{p.location}</td>
                          <td>
                            <button 
                              className="action-btn-delete"
                              onClick={() => handleDeleteSparePart(p.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="table-empty-row">No spare parts available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Biker Gear Management */}
          {activeTab === 'bikerGear' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls justify-between">
                <h3>System Biker Gear Database ({bikerGear.length})</h3>
                <button className="admin-btn-primary" onClick={() => setShowBikerGearModal(true)}>
                  <Plus size={16} />
                  <span>Add Biker Gear</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Brand</th>
                      <th>Size</th>
                      <th>Condition</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikerGear.length > 0 ? (
                      bikerGear.map(g => (
                        <tr key={g.id}>
                          <td>#{g.id}</td>
                          <td>
                            <img className="table-row-img" src={g.image || 'https://via.placeholder.com/60'} alt={g.name} />
                          </td>
                          <td className="font-bold">{g.name}</td>
                          <td>{g.category}</td>
                          <td>{g.subCategory || 'N/A'}</td>
                          <td>{g.brand || 'N/A'}</td>
                          <td>{g.size || 'N/A'}</td>
                          <td>
                            <span className={`badge-cond ${g.condition === 'New' ? 'badge-new' : 'badge-used'}`}>
                              {g.condition}
                            </span>
                          </td>
                          <td>LKR {g.price.toLocaleString()}</td>
                          <td>{g.location}</td>
                          <td>{g.verifiedSeller ? 'Yes' : 'No'}</td>
                          <td>
                            <button 
                              className="action-btn-delete"
                              onClick={() => handleDeleteBikerGear(g.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="table-empty-row">No biker gear items available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Manage Memberships */}
          {activeTab === 'memberships' && (
            <div className="admin-tab-content fade-in">
              <div className="tab-actions-header">
                <h3>Commercial Showroom Memberships ({memberships.length})</h3>
                <button className="admin-action-btn" onClick={openAddMembershipModal}>
                  <Plus size={16} />
                  <span>Add Membership Plan</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Tier</th>
                      <th>Cost Per Ad</th>
                      <th>Inventory Cap</th>
                      <th>Monthly Vouchers</th>
                      <th>Discount/Badge</th>
                      <th>Total Cost</th>
                      <th>Best Value?</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.length > 0 ? (
                      memberships.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 'bold' }}>{m.planName}</td>
                          <td>
                            <span className={`badge-cond ${m.tier === 'plus' ? 'badge-new' : 'badge-used'}`} style={{ textTransform: 'capitalize' }}>
                              {m.tier}
                            </span>
                          </td>
                          <td>LKR {parseFloat(m.costPerAd).toLocaleString()}</td>
                          <td>{m.inventoryCap} Active Listings</td>
                          <td>{m.monthlyVouchers}</td>
                          <td>{m.discountText || 'N/A'}</td>
                          <td style={{ fontWeight: 'bold' }}>LKR {parseFloat(m.totalCost).toLocaleString()}</td>
                          <td>{m.isBestValue ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="flex gap-2">
                              <button 
                                className="admin-action-btn" 
                                style={{ padding: '4px 8px', fontSize: '11px', background: '#e2e8f0', color: '#1e293b' }}
                                onClick={() => openEditMembershipModal(m)}
                              >
                                Edit
                              </button>
                              <button 
                                className="action-btn-delete"
                                onClick={() => handleDeleteMembership(m.id)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="table-empty-row">No showroom membership plans available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Manage Membership Requests */}
          {activeTab === 'membershipRequests' && (
            <div className="admin-tab-content fade-in">
              <div className="tab-actions-header">
                <h3>Membership Bank Slip Verification ({membershipRequests.length})</h3>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Shop Logo</th>
                      <th>Dealer Name</th>
                      <th>Email & Hotline</th>
                      <th>Target Plan</th>
                      <th>Bank Deposit Slip</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membershipRequests.length > 0 ? (
                      membershipRequests.map(r => (
                        <tr key={r.id}>
                          <td>
                            {r.shopImage ? (
                              <img 
                                src={r.shopImage} 
                                alt="Shop Logo" 
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px', 
                                  border: '1px solid #e2e8f0' 
                                }} 
                              />
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>No Logo</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{r.shopName}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span>{r.email}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>+94 {r.phone}</span>
                            </div>
                          </td>
                          <td>
                            {r.membership ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 'bold' }}>{r.membership.planName}</span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>LKR {parseFloat(r.membership.totalCost).toLocaleString()}</span>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {r.slipImage ? (
                              <a href={r.slipImage} target="_blank" rel="noopener noreferrer" title="Click to view full receipt">
                                <img 
                                  src={r.slipImage} 
                                  alt="Bank slip receipt" 
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0', 
                                    cursor: 'zoom-in' 
                                  }} 
                                />
                              </a>
                            ) : 'No Image'}
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status badge-status-${r.status}`} style={{ textTransform: 'capitalize' }}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            {r.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="admin-action-btn"
                                  style={{ padding: '6px 12px', fontSize: '11px', background: '#22c55e', color: 'white' }}
                                  onClick={() => handleUpdateMembershipRequest(r.id, 'approved')}
                                  disabled={actionLoading}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="action-btn-delete"
                                  style={{ padding: '6px 12px', fontSize: '11px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none' }}
                                  onClick={() => handleUpdateMembershipRequest(r.id, 'rejected')}
                                  disabled={actionLoading}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Verified</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="table-empty-row">No showroom membership verification requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Boost Post Approvals */}
          {activeTab === 'boostRequests' && (
            <div className="admin-tab-content fade-in">
              <div className="tab-header">
                <div>
                  <h2>Boost Post Remittance Approvals</h2>
                  <p>Audit bank remittance slips and approve ad boost promotions for private sellers</p>
                </div>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Target Listing</th>
                      <th>Seller Info</th>
                      <th>Package & Price</th>
                      <th>Bank Slip</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boostRequests.length > 0 ? (
                      boostRequests.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {r.vehicle ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {r.vehicle.image ? (
                                  <img 
                                    src={r.vehicle.image} 
                                    alt={r.vehicle.title} 
                                    style={{ width: '48px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                                  />
                                ) : (
                                  <div style={{ width: '48px', height: '40px', background: '#e2e8f0', borderRadius: '6px' }} />
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{r.vehicle.title}</span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    {r.vehicle.price ? `Rs. ${Number(r.vehicle.price).toLocaleString()}` : 'Negotiable'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Vehicle #{r.vehicleId}</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.user?.name || 'Seller'}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{r.user?.email || 'N/A'}</span>
                              {r.user?.phone && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>+94 {r.user.phone}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>{r.packageName}</span>
                              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>
                                Rs. {Number(r.amount).toLocaleString('en-LK')}
                              </span>
                            </div>
                          </td>
                          <td>
                            {r.slipImage ? (
                              <a href={r.slipImage} target="_blank" rel="noopener noreferrer" title="Click to view bank slip receipt">
                                <img 
                                  src={r.slipImage} 
                                  alt="Bank slip receipt" 
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0', 
                                    cursor: 'zoom-in' 
                                  }} 
                                />
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>No Slip</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status badge-status-${r.status}`} style={{ textTransform: 'capitalize' }}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            {r.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="admin-action-btn"
                                  style={{ padding: '6px 12px', fontSize: '11px', background: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                  onClick={() => handleUpdateBoostRequest(r.id, 'approved')}
                                  disabled={actionLoading}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="action-btn-delete"
                                  style={{ padding: '6px 12px', fontSize: '11px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                  onClick={() => handleUpdateBoostRequest(r.id, 'rejected')}
                                  disabled={actionLoading}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="table-empty-row">No boost post requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 8: Ad Manager */}
          {activeTab === 'adManager' && (
            <div className="admin-tab-content fade-in">
              <div className="table-controls">
                <div className="search-bar-wrapper">
                  <h3 className="text-lg font-bold text-foreground">Advertisement Banner Manager</h3>
                  <p className="text-xs text-muted-foreground">
                    Upload custom banner images or edit titles, call-to-action buttons, and target URLs for top header (970x90), side skyscraper (160x600), and square box (250x250) ads.
                  </p>
                </div>
              </div>

              <div className="ad-manager-grid">
                {/* 1. Header Leaderboard Ad (970x90) */}
                <div className="ad-manager-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-slot-badge">SLOT 1</span>
                      <h4>Top Header Leaderboard (970x90)</h4>
                    </div>
                    <label className="ad-toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!adBanners['header_leaderboard']?.isEnabled}
                        onChange={e => handleToggleAdStatus('header_leaderboard', e.target.checked)}
                      />
                      <span className="ad-toggle-slider"></span>
                      <span className="ad-toggle-label">
                        {adBanners['header_leaderboard']?.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="ad-preview-box">
                    <span className="ad-preview-label"><Eye size={14} /> Live Banner Preview</span>
                    <LeaderboardAdBanner ad={adBanners['header_leaderboard']} isPreview={true} />
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-form-group ad-full-width">
                      <label>Upload Custom Banner Image (970x90)</label>
                      <div className="ad-upload-row">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-header-ad"
                          style={{ display: 'none' }}
                          onChange={e => handleAdImageUpload('header_leaderboard', e.target.files[0])}
                        />
                        <label htmlFor="upload-header-ad" className="btn btn-secondary ad-upload-btn">
                          <Upload size={14} />
                          {uploadingAdSlot === 'header_leaderboard' ? 'Uploading Image...' : 'Choose Image File'}
                        </label>
                        {adBanners['header_leaderboard']?.imageUrl && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAdFieldChange('header_leaderboard', 'imageUrl', '')}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Image URL (Optional Direct Link)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={adBanners['header_leaderboard']?.imageUrl || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'imageUrl', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Badge Tagline Text</label>
                      <input
                        type="text"
                        value={adBanners['header_leaderboard']?.badgeText || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'badgeText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={adBanners['header_leaderboard']?.buttonText || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'buttonText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Headline Title</label>
                      <input
                        type="text"
                        value={adBanners['header_leaderboard']?.title || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'title', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Subtitle / Description</label>
                      <input
                        type="text"
                        value={adBanners['header_leaderboard']?.subtitle || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Target Click URL</label>
                      <input
                        type="text"
                        value={adBanners['header_leaderboard']?.linkUrl || ''}
                        onChange={e => handleAdFieldChange('header_leaderboard', 'linkUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveAdBanner('header_leaderboard')}
                      disabled={actionLoading}
                    >
                      Save Leaderboard Banner
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResetAdBanner('header_leaderboard')}
                      disabled={actionLoading}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>

                {/* 2. Side Skyscraper Ad (160x600) */}
                <div className="ad-manager-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-slot-badge">SLOT 2</span>
                      <h4>Side Skyscraper Banner (160x600)</h4>
                    </div>
                    <label className="ad-toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!adBanners['side_skyscraper']?.isEnabled}
                        onChange={e => handleToggleAdStatus('side_skyscraper', e.target.checked)}
                      />
                      <span className="ad-toggle-slider"></span>
                      <span className="ad-toggle-label">
                        {adBanners['side_skyscraper']?.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="ad-preview-box">
                    <span className="ad-preview-label"><Eye size={14} /> Live Banner Preview</span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SkyscraperAdBanner ad={adBanners['side_skyscraper']} isPreview={true} />
                    </div>
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-form-group ad-full-width">
                      <label>Upload Custom Banner Image (160x600)</label>
                      <div className="ad-upload-row">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-side-ad"
                          style={{ display: 'none' }}
                          onChange={e => handleAdImageUpload('side_skyscraper', e.target.files[0])}
                        />
                        <label htmlFor="upload-side-ad" className="btn btn-secondary ad-upload-btn">
                          <Upload size={14} />
                          {uploadingAdSlot === 'side_skyscraper' ? 'Uploading Image...' : 'Choose Image File'}
                        </label>
                        {adBanners['side_skyscraper']?.imageUrl && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAdFieldChange('side_skyscraper', 'imageUrl', '')}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Image URL (Optional Direct Link)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={adBanners['side_skyscraper']?.imageUrl || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'imageUrl', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Headline Title</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.title || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'title', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Highlight Box Text</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.highlightText || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'highlightText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Subtitle / Description</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.subtitle || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.buttonText || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'buttonText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Footer Terms Text</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.footerText || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'footerText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Target Click URL</label>
                      <input
                        type="text"
                        value={adBanners['side_skyscraper']?.linkUrl || ''}
                        onChange={e => handleAdFieldChange('side_skyscraper', 'linkUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveAdBanner('side_skyscraper')}
                      disabled={actionLoading}
                    >
                      Save Skyscraper Banner
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResetAdBanner('side_skyscraper')}
                      disabled={actionLoading}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>

                {/* 3. Square Box Ad (250x250) */}
                <div className="ad-manager-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-slot-badge">SLOT 3</span>
                      <h4>Square Box Banner (250x250)</h4>
                    </div>
                    <label className="ad-toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!adBanners['square_box']?.isEnabled}
                        onChange={e => handleToggleAdStatus('square_box', e.target.checked)}
                      />
                      <span className="ad-toggle-slider"></span>
                      <span className="ad-toggle-label">
                        {adBanners['square_box']?.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="ad-preview-box">
                    <span className="ad-preview-label"><Eye size={14} /> Live Banner Preview</span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SquareBoxAdBanner ad={adBanners['square_box']} isPreview={true} />
                    </div>
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-form-group ad-full-width">
                      <label>Upload Custom Banner Image (250x250)</label>
                      <div className="ad-upload-row">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-square-ad"
                          style={{ display: 'none' }}
                          onChange={e => handleAdImageUpload('square_box', e.target.files[0])}
                        />
                        <label htmlFor="upload-square-ad" className="btn btn-secondary ad-upload-btn">
                          <Upload size={14} />
                          {uploadingAdSlot === 'square_box' ? 'Uploading Image...' : 'Choose Image File'}
                        </label>
                        {adBanners['square_box']?.imageUrl && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAdFieldChange('square_box', 'imageUrl', '')}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Image URL (Optional Direct Link)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={adBanners['square_box']?.imageUrl || ''}
                        onChange={e => handleAdFieldChange('square_box', 'imageUrl', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Badge Tag Text</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.badgeText || ''}
                        onChange={e => handleAdFieldChange('square_box', 'badgeText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.buttonText || ''}
                        onChange={e => handleAdFieldChange('square_box', 'buttonText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Headline Title</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.title || ''}
                        onChange={e => handleAdFieldChange('square_box', 'title', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Subtitle / Description</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.subtitle || ''}
                        onChange={e => handleAdFieldChange('square_box', 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Target Click URL</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.linkUrl || ''}
                        onChange={e => handleAdFieldChange('square_box', 'linkUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveAdBanner('side_skyscraper')}
                      disabled={actionLoading}
                    >
                      Save Skyscraper Banner
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResetAdBanner('side_skyscraper')}
                      disabled={actionLoading}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>

                {/* 3. Square Box Ad (250x250) */}
                <div className="ad-manager-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-slot-badge">SLOT 3</span>
                      <h4>Square Box Banner (250x250)</h4>
                    </div>
                    <label className="ad-toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!adBanners['square_box']?.isEnabled}
                        onChange={e => handleAdFieldChange('square_box', 'isEnabled', e.target.checked)}
                      />
                      <span className="ad-toggle-slider"></span>
                      <span className="ad-toggle-label">
                        {adBanners['square_box']?.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="ad-preview-box">
                    <span className="ad-preview-label"><Eye size={14} /> Live Banner Preview</span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SquareBoxAdBanner ad={adBanners['square_box']} />
                    </div>
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-form-group ad-full-width">
                      <label>Upload Custom Banner Image (250x250)</label>
                      <div className="ad-upload-row">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-square-ad"
                          style={{ display: 'none' }}
                          onChange={e => handleAdImageUpload('square_box', e.target.files[0])}
                        />
                        <label htmlFor="upload-square-ad" className="btn btn-secondary ad-upload-btn">
                          <Upload size={14} />
                          {uploadingAdSlot === 'square_box' ? 'Uploading Image...' : 'Choose Image File'}
                        </label>
                        {adBanners['square_box']?.imageUrl && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAdFieldChange('square_box', 'imageUrl', '')}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Image URL (Optional Direct Link)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={adBanners['square_box']?.imageUrl || ''}
                        onChange={e => handleAdFieldChange('square_box', 'imageUrl', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Badge Tag Text</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.badgeText || ''}
                        onChange={e => handleAdFieldChange('square_box', 'badgeText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.buttonText || ''}
                        onChange={e => handleAdFieldChange('square_box', 'buttonText', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Headline Title</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.title || ''}
                        onChange={e => handleAdFieldChange('square_box', 'title', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Subtitle / Description</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.subtitle || ''}
                        onChange={e => handleAdFieldChange('square_box', 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="ad-form-group ad-full-width">
                      <label>Target Click URL</label>
                      <input
                        type="text"
                        value={adBanners['square_box']?.linkUrl || ''}
                        onChange={e => handleAdFieldChange('square_box', 'linkUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveAdBanner('square_box')}
                      disabled={actionLoading}
                    >
                      Save Square Banner
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResetAdBanner('square_box')}
                      disabled={actionLoading}
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add Spare Part */}
      {showSparePartModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Create New Spare Part Listing</h3>
              <button className="modal-close-btn" onClick={() => setShowSparePartModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSparePart} className="modal-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input 
                  type="text" 
                  value={sparePartForm.name} 
                  onChange={(e) => setSparePartForm({ ...sparePartForm, name: e.target.value })} 
                  required
                  placeholder="e.g. NGK Iridium Spark Plug"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={sparePartForm.category}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, category: e.target.value })}
                  >
                    <option value="Engine Parts">Engine Parts</option>
                    <option value="Tires & Wheels">Tires & Wheels</option>
                    <option value="Brakes & Suspension">Brakes & Suspension</option>
                    <option value="Body & Frame">Body & Frame</option>
                    <option value="Electricals">Electricals</option>
                    <option value="Other Spare Parts">Other Spare Parts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Condition *</label>
                  <select 
                    value={sparePartForm.condition}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, condition: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    value={sparePartForm.brand} 
                    onChange={(e) => setSparePartForm({ ...sparePartForm, brand: e.target.value })} 
                    placeholder="e.g. NGK, Brembo"
                  />
                </div>

                <div className="form-group">
                  <label>Compatibility</label>
                  <input 
                    type="text" 
                    value={sparePartForm.compatibility} 
                    onChange={(e) => setSparePartForm({ ...sparePartForm, compatibility: e.target.value })} 
                    placeholder="e.g. Yamaha FZ, Honda Hornet"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (LKR) *</label>
                  <input 
                    type="number" 
                    value={sparePartForm.price} 
                    onChange={(e) => setSparePartForm({ ...sparePartForm, price: e.target.value })} 
                    required
                    placeholder="LKR"
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    value={sparePartForm.location} 
                    onChange={(e) => setSparePartForm({ ...sparePartForm, location: e.target.value })} 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  value={sparePartForm.image} 
                  onChange={(e) => setSparePartForm({ ...sparePartForm, image: e.target.value })} 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowSparePartModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Biker Gear */}
      {showBikerGearModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Create New Biker Gear Listing</h3>
              <button className="modal-close-btn" onClick={() => setShowBikerGearModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBikerGear} className="modal-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input 
                  type="text" 
                  value={bikerGearForm.name} 
                  onChange={(e) => setBikerGearForm({ ...bikerGearForm, name: e.target.value })} 
                  required
                  placeholder="e.g. Shoei X-Fourteen Helmet"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={bikerGearForm.category}
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, category: e.target.value })}
                  >
                    <option value="Helmets">Helmets</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Boots">Boots</option>
                    <option value="Protective Gear">Protective Gear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subcategory</label>
                  <input 
                    type="text" 
                    value={bikerGearForm.subCategory} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, subCategory: e.target.value })} 
                    placeholder="e.g. Full Face, Modular"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    value={bikerGearForm.brand} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, brand: e.target.value })} 
                    placeholder="e.g. Shoei, Alpinestars"
                  />
                </div>

                <div className="form-group">
                  <label>Size</label>
                  <input 
                    type="text" 
                    value={bikerGearForm.size} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, size: e.target.value })} 
                    placeholder="e.g. M, L, XL, Universal"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Condition *</label>
                  <select 
                    value={bikerGearForm.condition}
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, condition: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={bikerGearForm.rating} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, rating: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (LKR) *</label>
                  <input 
                    type="number" 
                    value={bikerGearForm.price} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, price: e.target.value })} 
                    required
                    placeholder="LKR"
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    value={bikerGearForm.location} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, location: e.target.value })} 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-form-label">
                  <input 
                    type="checkbox" 
                    checked={bikerGearForm.verifiedSeller} 
                    onChange={(e) => setBikerGearForm({ ...bikerGearForm, verifiedSeller: e.target.checked })} 
                  />
                  <span>Verified Seller listing</span>
                </label>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  value={bikerGearForm.image} 
                  onChange={(e) => setBikerGearForm({ ...bikerGearForm, image: e.target.value })} 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowBikerGearModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Membership */}
      {showMembershipModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{isEditingMembership ? 'Edit Membership Plan' : 'Create New Membership Plan'}</h3>
              <button className="modal-close-btn" onClick={() => setShowMembershipModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={isEditingMembership ? handleEditMembership : handleAddMembership} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Name *</label>
                  <input 
                    type="text" 
                    value={membershipForm.planName} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, planName: e.target.value })} 
                    required
                    placeholder="e.g. Monthly Plan, Quarterly Plan"
                  />
                </div>
                <div className="form-group">
                  <label>Tier *</label>
                  <select 
                    value={membershipForm.tier} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, tier: e.target.value })}
                  >
                    <option value="plus">Plus Tier</option>
                    <option value="premium">Premium Tier</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Calculated Cost Per Ad (LKR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={membershipForm.costPerAd} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, costPerAd: e.target.value })} 
                    required
                    placeholder="e.g. 350.00"
                  />
                </div>
                <div className="form-group">
                  <label>Active Inventory Cap *</label>
                  <input 
                    type="number" 
                    value={membershipForm.inventoryCap} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, inventoryCap: e.target.value })} 
                    required
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bundled Vouchers *</label>
                  <input 
                    type="text" 
                    value={membershipForm.monthlyVouchers} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, monthlyVouchers: e.target.value })} 
                    required
                    placeholder="e.g. 1 Top Ad + 5 Bumps"
                  />
                </div>
                <div className="form-group">
                  <label>Discount/Savings Text</label>
                  <input 
                    type="text" 
                    value={membershipForm.discountText} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, discountText: e.target.value })} 
                    placeholder="e.g. Contract Discount Applied"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Cost (LKR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={membershipForm.totalCost} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, totalCost: e.target.value })} 
                    required
                    placeholder="e.g. 7000.00"
                  />
                </div>
                <div className="form-group flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="isBestValue"
                    checked={membershipForm.isBestValue} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, isBestValue: e.target.checked })} 
                    className="w-4 h-4"
                  />
                  <label htmlFor="isBestValue" className="font-bold cursor-pointer select-none">Mark as Best Value</label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowMembershipModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : (isEditingMembership ? 'Save Changes' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Vehicle Listing */}
      {showVehicleEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Edit Vehicle Post</h3>
              <button className="modal-close-btn" onClick={() => setShowVehicleEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveVehicleEdit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Make *</label>
                  <input 
                    type="text" 
                    value={vehicleEditForm.make} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, make: e.target.value })} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input 
                    type="text" 
                    value={vehicleEditForm.model} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, model: e.target.value })} 
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <input 
                    type="number" 
                    value={vehicleEditForm.year} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, year: e.target.value })} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (LKR)</label>
                  <input 
                    type="number" 
                    value={vehicleEditForm.price} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, price: e.target.value })} 
                    placeholder="Leave empty for Negotiable"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Condition</label>
                  <select 
                    value={vehicleEditForm.condition}
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, condition: e.target.value })}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="reconditioned">Reconditioned</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={vehicleEditForm.location} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, location: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mileage (km)</label>
                  <input 
                    type="number" 
                    value={vehicleEditForm.mileageKm} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, mileageKm: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Engine Capacity (CC)</label>
                  <input 
                    type="number" 
                    value={vehicleEditForm.engineCapacityCc} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, engineCapacityCc: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fuel Type</label>
                  <input 
                    type="text" 
                    value={vehicleEditForm.fuelType} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, fuelType: e.target.value })} 
                    placeholder="e.g. Petrol, Electric"
                  />
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <input 
                    type="text" 
                    value={vehicleEditForm.transmission} 
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, transmission: e.target.value })} 
                    placeholder="e.g. Manual, Automatic"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Approval Status</label>
                  <select 
                    value={vehicleEditForm.approvalStatus}
                    onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, approvalStatus: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Main Image Management Section */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>Main Display Image</span>
                  {uploadingMainImage && <span style={{ fontSize: '0.8rem', color: '#ffd600' }}>Uploading to cloud...</span>}
                </label>
                
                {/* Visual Preview Card */}
                {vehicleEditForm.image ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#0a0a0c' }}>
                    <img 
                      src={vehicleEditForm.image} 
                      alt="Main Vehicle Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image'; }}
                    />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px' }}>
                      <label style={{ background: '#ffd600', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Upload size={14} /> Change Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleMainFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setVehicleEditForm(prev => ({ ...prev, image: '' }))}
                        style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Remove main image"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <p style={{ margin: '0 0 0.75rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>No main display image uploaded</p>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffd600', color: '#000', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <Upload size={16} /> Upload Main Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleMainFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Gallery Images Management Section */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>Gallery Photos ({vehicleEditForm.gallery?.length || 0})</span>
                  {uploadingGalleryImage && <span style={{ fontSize: '0.8rem', color: '#ffd600' }}>Uploading...</span>}
                </label>

                {/* Gallery Thumbnails Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginTop: '6px' }}>
                  {vehicleEditForm.gallery && vehicleEditForm.gallery.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '90px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#000' }}>
                      <img 
                        src={imgUrl} 
                        alt={`Gallery item ${idx + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/90x70?text=Invalid'; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add Gallery Image Button */}
                  <label style={{ width: '90px', height: '70px', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', color: '#a1a1aa' }}>
                    <Plus size={18} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Add Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleGalleryFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={vehicleEditForm.description} 
                  onChange={(e) => setVehicleEditForm({ ...vehicleEditForm, description: e.target.value })} 
                  placeholder="Vehicle specifications and details..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowVehicleEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;