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

export function getVehicles() {
  return request('/vehicles', { method: 'GET' });
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
