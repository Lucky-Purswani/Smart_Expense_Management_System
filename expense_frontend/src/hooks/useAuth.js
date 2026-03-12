"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { authApi, setTokens, clearTokens } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { user, loading, isAuthenticated, login: setAuth, logout: clearAuth, setUser } = useAuthContext();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const login = async (email, password) => {
    setError(null);
    setSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      await setAuth(accessToken, refreshToken, userData);
      router.push("/dashboard");
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await clearAuth();
    router.push("/auth/login");
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    submitting,
    login,
    logout,
    clearError: () => setError(null),
  };
}
