// src/store/vehiclesStore.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { sampleVehicles } from '../data/sampleVehicles';

// All user-posted ads will be stored here
const STORAGE_KEY = 'userVehicles_v1';

const VehiclesContext = createContext(null);

function loadUserVehicles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.warn('Failed to load user vehicles from localStorage', e);
    return [];
  }
}

function saveUserVehicles(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save user vehicles to localStorage', e);
  }
}

// Safe unique ID for frontend-only use
function genId({ make, model }) {
  const base = `${make || 'make'}-${model || 'model'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const rand = Math.random().toString(36).slice(2, 7);
  return `user-${base}-${Date.now()}-${rand}`;
}

export function VehiclesProvider({ children }) {
  const [userVehicles, setUserVehicles] = useState(loadUserVehicles());

  // Persist on every change
  useEffect(() => {
    saveUserVehicles(userVehicles);
  }, [userVehicles]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setUserVehicles(loadUserVehicles());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Merge sample + user
  const allVehicles = useMemo(() => {
    return [...sampleVehicles, ...userVehicles];
  }, [userVehicles]);

  // Create
  const addVehicle = (data) => {
    const id = genId(data);
    const now = new Date().toISOString();
    const parsedPrice =
      data.price === '' || data.price == null ? null : Number(data.price);

    const v = {
      id,
      title:
        data.title?.trim() ||
        `${data.make || ''} ${data.model || ''}`.trim() ||
        'Untitled Vehicle',
      type: data.type, // 'scooters' | 'sport' | 'cruiser' | 'electric' | 'trail' | 'atv' | 'adv' | 'dual-sport'
      make: data.make?.trim() || '',
      model: data.model?.trim() || '',
      year: Number(data.year) || null,
      registerYear: Number(data.registerYear) || Number(data.year) || null,
      price: Number.isFinite(parsedPrice) ? parsedPrice : null, // null => Negotiable
      mileageKm:
        data.mileageKm === '' || data.mileageKm == null
          ? null
          : Number(data.mileageKm),
      engineCc:
        data.engineCapacityCc === '' || data.engineCapacityCc == null
          ? null
          : Number(data.engineCapacityCc),
      engineCapacityCc:
        data.engineCapacityCc === '' || data.engineCapacityCc == null
          ? null
          : Number(data.engineCapacityCc),
      transmission: data.transmission || '',
      fuelType: data.fuelType || '',
      color: data.color || '',
      condition: data.condition || '',
      location: data.location || '',
      postedAt: now,
      phone: data.phone || '',
      image:
        data.image ||
        (Array.isArray(data.gallery) && data.gallery[0]) ||
        '',
      gallery: Array.isArray(data.gallery)
        ? data.gallery.filter(Boolean)
        : data.image
          ? [data.image]
          : [],
      categories: data.categories || [],
      tags: data.tags || [],
    };

    setUserVehicles((prev) => [v, ...prev]);
    return v;
  };

  // Update
  const updateVehicle = (id, patch) => {
    setUserVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  // Delete
  const removeVehicle = (id) => {
    setUserVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // Dev helper
  const clearAllUserVehicles = () => setUserVehicles([]);

  const value = {
    allVehicles,
    userVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    clearAllUserVehicles,
  };

  return (
    <VehiclesContext.Provider value={value}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error('useVehicles must be used within VehiclesProvider');
  return ctx;
}