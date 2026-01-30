const API_BASE_RAW = process.env.REACT_APP_API_BASE_URL || '';

function backendOriginFromApiBase() {
  if (!API_BASE_RAW) return '';
  try {
    // If API base is absolute (e.g., http://localhost:3001/api)
    const u = new URL(API_BASE_RAW);
    return u.origin;
  } catch {
    return '';
  }
}

const BACKEND_ORIGIN = backendOriginFromApiBase();

export function resolveMediaUrl(url) {
  if (!url) return url;

  // Uploaded assets are served from the backend.
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    return BACKEND_ORIGIN ? `${BACKEND_ORIGIN}${url}` : url;
  }

  // Everything else (public assets, external URLs) can be used as-is.
  return url;
}
