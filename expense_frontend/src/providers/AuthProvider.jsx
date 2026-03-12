"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { userApi, setTokens, clearTokens, hasTokens, authApi } from "@/services/api";

const AuthContext = createContext(null);

// Refresh 2 minutes before the 15-min access token expires
const REFRESH_INTERVAL_MS = 13 * 60 * 1000; // 13 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Silent token refresh — runs in background
  const silentRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const response = await authApi.refreshToken({ refreshToken });
      setTokens(response.data.accessToken, null);
    } catch (err) {
      // If refresh fails with auth error, session is truly expired
      if (err.status === 401 || err.status === 403) {
        stopRefreshTimer();
        clearTokens();
        setUser(null);
      }
      // Network errors — don't clear, will retry next interval
    }
  }, []);

  const startRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    // Start interval
    refreshTimerRef.current = setInterval(silentRefresh, REFRESH_INTERVAL_MS);
  }, [silentRefresh]);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // On mount — check if user has tokens and fetch profile
  const checkAuth = useCallback(async () => {
    if (!hasTokens()) {
      setLoading(false);
      return;
    }

    try {
      const response = await userApi.getMe();
      setUser(response.data);
      // User is valid — start proactive refresh
      startRefreshTimer();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [startRefreshTimer]);

  useEffect(() => {
    checkAuth();
    // Cleanup timer on unmount
    return () => stopRefreshTimer();
  }, [checkAuth, stopRefreshTimer]);

  const login = async (accessToken, refreshToken, userData) => {
    setTokens(accessToken, refreshToken);
    setUser(userData);
    // Start proactive refresh after login
    startRefreshTimer();
  };

  const logout = async () => {
    stopRefreshTimer();
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        authApi.logout({ refreshToken }).catch(() => {});
      }
    } catch {
      // Ignore errors
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
