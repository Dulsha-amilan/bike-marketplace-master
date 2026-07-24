import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Bike, Wrench, Trash2, Plus, X, 
  LayoutDashboard, ShoppingBag, AlertCircle, 
  CheckCircle, ArrowLeft, RefreshCw, UserCheck, Check, Ban,
  CreditCard
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { 
  getAdminVehicles, deleteVehicle, getSpareParts, getBikerGear,
  getAdminUsers, updateUserRole, deleteUser,
  createSparePart, deleteSparePart, createBikerGear, deleteBikerGear,
  updateVehicleStatus, deleteAllVehicles, getAdminStorageUpgrades,
  updateStorageUpgradeRequest,
  getMemberships, createMembership, updateMembership, deleteMembership,
  getMembershipRequests, updateMembershipRequestStatus
} from '../api/bikeApi';
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
      const [vehiclesData, sparePartsData, bikerGearData, usersData, upgradesData, membershipsData, requestsData] = await Promise.all([
        getAdminVehicles(),
        getSpareParts(),
        getBikerGear(),
        getAdminUsers(),
        getAdminStorageUpgrades(),
        getMemberships(),
        getMembershipRequests()
      ]);
      setVehicles(vehiclesData || []);
      setSpareParts(sparePartsData || []);
      setBikerGear(bikerGearData || []);
      setUsers(usersData || []);
      setUpgrades(upgradesData || []);
      setMemberships(membershipsData || []);
      setMembershipRequests(requestsData || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
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
              className={`admin-menu-item ${activeTab === 'spareParts' ? 'active' : ''}`}
              onClick={() => setActiveTab('spareParts')}
            >
              <Wrench size={18} />
              <span>Manage Spare Parts</span>
            </button>
            <button 
              className={`admin-menu-item ${activeTab === 'bikerGear' ? 'active' : ''}`}
              onClick={() => setActiveTab('bikerGear')}
            >
              <ShoppingBag size={18} />
              <span>Manage Biker Gear</span>
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

                <div className="analytics-card" onClick={() => setActiveTab('spareParts')}>
                  <div className="analytics-icon-wrapper parts-accent">
                    <Wrench size={24} />
                  </div>
                  <div className="analytics-details">
                    <span className="analytics-value">{spareParts.length}</span>
                    <span className="analytics-label">Spare Parts</span>
                  </div>
                </div>

                <div className="analytics-card" onClick={() => setActiveTab('bikerGear')}>
                  <div className="analytics-icon-wrapper gear-accent">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="analytics-details">
                    <span className="analytics-value">{bikerGear.length}</span>
                    <span className="analytics-label">Biker Gear Items</span>
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
    </div>
  );
};

export default AdminDashboard;