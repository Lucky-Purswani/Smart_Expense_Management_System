"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppShell({ children }) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-bg">
        <div className="w-8 h-8 border-2 border-border-main border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-app-bg overflow-x-hidden">
      {/* Sidebar is relative on desktop (takes space) and fixed on mobile (overlay) */}
      <Sidebar />
      
      {/* Main Content Area naturally flows next to sidebar */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-sidebar">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
