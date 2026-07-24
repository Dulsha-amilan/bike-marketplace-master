function capitalizeFirstLetter(str) {
  if (!str) return str;
  const s = String(str).trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Map hero / global search UI state to GET /api/vehicles query params */
export function filtersToApiParams(filters = {}) {
  const params = {};
  const brand = (filters.brand || '').trim();
  const model = (filters.model || '').trim();
  const location = capitalizeFirstLetter(filters.location || '');
  const priceRange = (filters.priceRange || '').trim();

  if (brand) params.brand = brand;
  if (model) params.model = model;
  if (location) params.location = location;
  if (priceRange) params.priceRange = priceRange;

  return params;
}

export function parseFiltersFromSearchParams(searchParams) {
  const sp = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(searchParams || '');

  return {
    brand: sp.get('brand') || '',
    model: sp.get('model') || '',
    priceRange: sp.get('priceRange') || '',
    location: capitalizeFirstLetter(sp.get('location') || ''),
  };
}

export function filtersToQueryString(filters = {}) {
  const sp = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      let strVal = String(value).trim();
      if (key === 'location') {
        strVal = capitalizeFirstLetter(strVal);
      }
      sp.set(key, strVal);
    }
  });
  return sp.toString();
}

export function hasActiveSearchFilters(filters = {}) {
  return Object.values(filters).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ''
  );
}

export function formatFilterSummary(filters = {}) {
  const parts = [];
  if (filters.brand) parts.push(`Brand: ${titleCase(filters.brand)}`);
  if (filters.model) parts.push(`Model: ${filters.model}`);
  if (filters.priceRange) parts.push(`Price: ${formatPriceRangeLabel(filters.priceRange)}`);
  if (filters.location) parts.push(`Location: ${titleCase(filters.location)}`);
  return parts;
}

function titleCase(value) {
  return String(value)
    .trim()
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatPriceRangeLabel(priceRange) {
  const labels = {
    '0-100000': 'Under Rs. 100,000',
    '100000-300000': 'Rs. 100,000 - 300,000',
    '300000-500000': 'Rs. 300,000 - 500,000',
    '500000+': 'Above Rs. 500,000',
  };
  return labels[priceRange] || priceRange;
}
