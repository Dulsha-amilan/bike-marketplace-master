const API_BASE_RAW = process.env.REACT_APP_API_BASE_URL || '/api';
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

async function request(path, options) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const token = typeof window !== 'undefined' ? localStorage.getItem('bikeeka_auth_token') : null;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options && options.headers ? options.headers : {}),
  };

  const res = await fetch(`${API_BASE}${p}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.message ? `: ${data.message}` : '';
    } catch (_) {
      // ignore
    }
    throw new Error(`API ${res.status} ${res.statusText}${detail}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export function getVehicles(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        if (val.length > 0) {
          query.append(key, val.join(','));
        }
      } else {
        query.append(key, val);
      }
    }
  });
  const queryString = query.toString();
  return request(`/vehicles${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
}

export function getVehicleById(id) {
  return request(`/vehicles/${encodeURIComponent(id)}`, { method: 'GET' });
}

export function createVehicle(payload) {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  return request(isFormData ? '/vehicles/upload' : '/vehicles', {
    method: 'POST',
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export function patchVehicle(id, payload) {
  return request(`/vehicles/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updateVehicleWithFormData(id, formData) {
  return request(`/vehicles/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: formData,
  });
}

export function deleteVehicle(id) {
  return request(`/vehicles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getSpareParts() {
  return request('/spare-parts', { method: 'GET' });
}

export function getBikerGear() {
  return request('/biker-gear', { method: 'GET' });
}

export function getChatbotResponses() {
  return request('/chatbot/responses', { method: 'GET' });
}

export function getAdminUsers() {
  return request('/admin/users', { method: 'GET' });
}

export function updateUserRole(id, role) {
  return request(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(id) {
  return request(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function createSparePart(payload) {
  return request('/spare-parts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteSparePart(id) {
  return request(`/spare-parts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function createBikerGear(payload) {
  return request('/biker-gear', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteBikerGear(id) {
  return request(`/biker-gear/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getAdminVehicles() {
  return request('/admin/vehicles', { method: 'GET' });
}

export function updateVehicleStatus(id, status) {
  return request(`/admin/vehicles/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateAdminVehicle(id, payload) {
  return request(`/admin/vehicles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return request('/upload/image', {
    method: 'POST',
    body: formData,
  });
}

export function deleteAllVehicles() {
  return request('/admin/vehicles', { method: 'DELETE' });
}

export function requestStorageUpgrade() {
  return request('/storage-upgrade/request', { method: 'POST' });
}

export function getStorageUpgradeStatus() {
  return request('/storage-upgrade/status', { method: 'GET' });
}

export function getAdminStorageUpgrades() {
  return request('/admin/storage-upgrades', { method: 'GET' });
}

export function updateStorageUpgradeRequest(id, status) {
  return request(`/admin/storage-upgrades/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getMemberships() {
  return request('/memberships', { method: 'GET' });
}

export function createMembership(payload) {
  return request('/memberships', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMembership(id, payload) {
  return request(`/memberships/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteMembership(id) {
  return request(`/memberships/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function submitMembershipRequest(formData) {
  return request('/memberships/requests', {
    method: 'POST',
    body: formData,
  });
}

export function getMembershipRequests() {
  return request('/memberships/requests', { method: 'GET' });
}

export function updateMembershipRequestStatus(id, status) {
  return request(`/memberships/requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getMyPendingMembershipRequest() {
  return request('/memberships/requests/my-pending', { method: 'GET' });
}

export function getMyApprovedMembershipRequest() {
  return request('/memberships/requests/my-approved', { method: 'GET' });
}

export function updateMyApprovedMembershipRequest(formData) {
  return request('/memberships/requests/my-approved', {
    method: 'PATCH',
    body: formData,
  });
}

/* Boost Post Request API endpoints */
export function submitBoostPostRequest(formData) {
  return request('/boost-requests', {
    method: 'POST',
    body: formData,
  });
}

export function getMyBoostRequests() {
  return request('/boost-requests/my', { method: 'GET' });
}

export function getAdminBoostRequests() {
  return request('/boost-requests', { method: 'GET' });
}

export function updateBoostRequestStatus(id, status) {
  return request(`/boost-requests/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* Ad Banner Manager API endpoints */
export function getAdBanners() {
  return request('/ads', { method: 'GET' });
}

export function getAdminAdBanners() {
  return request('/admin/ads', { method: 'GET' });
}

export function updateAdBanner(slotId, payload) {
  return request(`/admin/ads/${encodeURIComponent(slotId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}


