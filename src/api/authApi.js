const API_BASE_RAW = process.env.REACT_APP_API_BASE_URL || '/api';
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

async function authRequest(path, options) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options && options.headers ? options.headers : {}),
  };

  const res = await fetch(`${API_BASE}${p}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

/**
 * Register a new user account
 */
export function registerUser({ name, email, phone, password }) {
  return authRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  });
}

/**
 * Log in with email and password
 */
export function loginUser({ email, password }) {
  return authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get current user profile using stored token
 */
export function getMe(token) {
  return authRequest('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
