// src/store/vehiclesStore.js
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  patchVehicle,
} from '../api/bikeApi';

const VehiclesContext = createContext(null);

export function VehiclesProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getVehicles();
      setVehicles(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load vehicles from API. Is the backend running?');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  const userVehicles = useMemo(
    () => vehicles.filter((v) => v.source === 'user'),
    [vehicles]
  );

  const allVehicles = useMemo(() => vehicles, [vehicles]);

  // Create
  const addVehicle = async (data) => {
    const created = await createVehicle(data);
    setVehicles((prev) => [created, ...prev]);
    return created;
  };

  // Update (user vehicles only)
  const updateVehicle = async (id, patch) => {
    const updated = await patchVehicle(id, patch);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  };

  // Delete (user vehicles only)
  const removeVehicle = async (id) => {
    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // Dev helper
  const clearAllUserVehicles = async () => {
    const currentUserVehicles = vehicles.filter((v) => v.source === 'user');
    for (const v of currentUserVehicles) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteVehicle(v.id);
      } catch (e) {
        console.warn('Failed to delete vehicle', v.id, e);
      }
    }
    await refreshVehicles();
  };

  const value = {
    allVehicles,
    userVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    clearAllUserVehicles,
    refreshVehicles,
    loading,
    error,
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