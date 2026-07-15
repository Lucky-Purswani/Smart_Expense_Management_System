"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Transfer", href: "/transfer" },
  { label: "Transactions", href: "/transactions" },
  { label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-panel-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/transfer" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center shadow-sm shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
            <span className="text-accent-text text-xs font-bold">T</span>
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            TransactPay
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover-bg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
