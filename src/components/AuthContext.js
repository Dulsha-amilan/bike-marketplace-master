import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerUser, loginUser, getMe, refreshTokens } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'bikeeka_auth_token';
const REFRESH_TOKEN_KEY = 'bikeeka_refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // On mount, try to restore session from stored token
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe(storedToken);
        if (!cancelled) {
          setUser(data.user);
          setToken(storedToken);
        }
      } catch (err) {
        // Token invalid/expired — try to refresh
        if (storedRefreshToken) {
          try {
            const refreshData = await refreshTokens(storedRefreshToken);
            if (!cancelled) {
              localStorage.setItem(TOKEN_KEY, refreshData.token);
              localStorage.setItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
              setToken(refreshData.token);
              setUser(refreshData.user);
            }
            return;
          } catch (refreshErr) {
            console.error('Refresh token expired or invalid:', refreshErr);
          }
        }
        // If refresh fails or no refresh token, clear credentials
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const register = useCallback(async ({ name, email, phone, password }) => {
    const data = await registerUser({ name, email, phone, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
