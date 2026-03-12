"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasTokens, clearTokens, setTokens } from "@/lib/api";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check auth state on mount
  useEffect(() => {
    setIsAuthenticated(hasTokens());
    setLoading(false);
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
    const isPublic = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    }

    if (isAuthenticated && isPublic) {
      router.replace("/transfer");
    }
  }, [isAuthenticated, loading, pathname, router]);

  const login = useCallback((accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
    router.push("/transfer");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore — still clear local tokens
    }
    clearTokens();
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
