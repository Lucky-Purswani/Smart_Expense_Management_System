"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Windows",
    href: "/windows",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-4 z-50 bg-panel-bg border border-border-main rounded-md text-text-main p-2 cursor-pointer shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        flex flex-col h-screen bg-panel-bg border-r border-border-main
        z-[70] transition-all duration-300 fixed top-0
        ${mobileOpen 
          ? "left-0 w-sidebar translate-x-0" 
          : "-translate-x-full md:translate-x-0 md:w-sidebar"
        }
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border-main">
          <div className="w-10 h-10 bg-brand text-brand-text rounded-md flex items-center justify-center shrink-0 shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-text-main tracking-tight">Expense Manager</span>

          {/* Mobile close */}
          <button
            className="md:hidden ml-auto text-text-sub hover:text-text-main cursor-pointer p-1"
            onClick={() => setMobileOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold
                transition-all duration-200
                ${isActive(item.href)
                  ? "bg-brand text-brand-text shadow-md"
                  : "text-text-sub hover:bg-hover-bg hover:text-text-main"
                }
              `}
              onClick={() => setMobileOpen(false)}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border-main mt-auto">
          <button
            className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold
              text-text-sub hover:text-danger hover:bg-danger-panel
              transition-all duration-200 cursor-pointer
              border-none bg-transparent w-full text-left"
            onClick={logout}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
