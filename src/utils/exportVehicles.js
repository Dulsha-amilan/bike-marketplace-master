// src/utils/exportVehicles.js
// Exports JS modules in "sampleVehicles style": unquoted keys, single-quoted strings.

function downloadString(content, mime, fileName) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function escapeString(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function isVehicleLike(obj) {
  return isPlainObject(obj) && (('id' in obj && 'title' in obj) || ('make' in obj && 'model' in obj));
}

// Ensure keys appear like your examples
function orderVehicleKeys(v) {
  const order = [
    'id',
    'type',
    'title',
    'make',
    'model',
    'year',
    'registerYear',
    'price',
    'mileageKm',
    'engineCc',
    'cc',
    'engineCapacityCc',
    'transmission',
    'fuelType',
    'color',
    'condition',
    'location',
    'postedAt',
    'phone',
    'image',
    'gallery',
    'categories',
    'tags',
  ];
  const out = {};
  for (const k of order) if (k in v) out[k] = v[k];
  for (const k of Object.keys(v)) if (!(k in out)) out[k] = v[k];
  return out;
}

function normalizeData(data) {
  if (Array.isArray(data)) {
    return data.map((x) => (isVehicleLike(x) ? orderVehicleKeys(x) : x));
  }
  if (isVehicleLike(data)) return orderVehicleKeys(data);
  return data;
}

// JS-style pretty printer (single quotes, unquoted keys where possible)
function jsLiteral(value, indent = '  ', depth = 0) {
  if (value === null) return 'null';
  const t = typeof value;

  if (t === 'number') return String(value);
  if (t === 'boolean') return value ? 'true' : 'false';
  if (t === 'string') return `'${escapeString(value)}'`;

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = value.map((v) => `${indent.repeat(depth + 1)}${jsLiteral(v, indent, depth + 1)}`).join(',\n');
    return `[\n${inner}\n${indent.repeat(depth)}]`;
    }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const lines = keys.map((k) => {
      const keyStr = IDENTIFIER_RE.test(k) ? k : `'${escapeString(k)}'`;
      const valStr = jsLiteral(value[k], indent, depth + 1);
      return `${indent.repeat(depth + 1)}${keyStr}: ${valStr}`;
    });
    return `{\n${lines.join(',\n')}\n${indent.repeat(depth)}}`;
  }

  // Fallback for unsupported types
  return 'null';
}

function toJsModuleLiteral({ variableName, data, addBanner = true }) {
  const normalized = normalizeData(data);
  const banner = addBanner
    ? `// Generated at ${new Date().toISOString()}\n// Items: ${Array.isArray(normalized) ? normalized.length : 1}\n\n`
    : '';
  const body = `export const ${variableName} = ${jsLiteral(normalized)};\n`;
  return banner + body;
}

// Public API (same names as before for drop-in replacement)

// 1) Download a single vehicle as a JS module (vehicle object)
export function downloadSingleVehicleJS(vehicle, opts = {}) {
  const v = normalizeData(vehicle);
  const fileName =
    opts.fileName ||
    `vehicle-${(v?.id || 'new').toString().replace(/[^a-z0-9-]+/gi, '-')}.js`;
  const js = toJsModuleLiteral({ variableName: 'vehicle', data: v });
  downloadString(js, 'text/javascript', fileName);
}

// 1b) Download object snippet only (no export const) — ready to paste into sampleVehicles array
export function downloadVehicleObjectSnippet(vehicle, opts = {}) {
  const v = normalizeData(vehicle);
  const fileName =
    opts.fileName ||
    `vehicle-snippet-${(v?.id || 'new').toString().replace(/[^a-z0-9-]+/gi, '-')}.js`;
  const content = `${jsLiteral(v)},\n`; // trailing comma to paste inside an array
  const banner = `// Object snippet generated at ${new Date().toISOString()}\n\n`;
  downloadString(banner + content, 'text/javascript', fileName);
}

// 2) Download only user-posted vehicles (array)
export function downloadUserVehiclesJS(userVehicles, opts = {}) {
  const fileName = opts.fileName || 'userVehicles.js';
  const js = toJsModuleLiteral({
    variableName: 'userVehicles',
    data: normalizeData(userVehicles || []),
  });
  downloadString(js, 'text/javascript', fileName);
}

// 3) Download merged as sampleVehicles.js (seed + user)
export function downloadMergedSampleVehiclesJS(allVehicles, opts = {}) {
  const fileName = opts.fileName || 'sampleVehicles.js';
  const js = toJsModuleLiteral({
    variableName: 'sampleVehicles',
    data: normalizeData(allVehicles || []),
  });
  downloadString(js, 'text/javascript', fileName);
}