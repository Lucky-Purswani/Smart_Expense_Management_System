"use client";

import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/windows": "Expense Windows",
  "/profile": "Profile",
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const title = pageTitles[pathname] || "Expense Manager";

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="flex items-center justify-between px-8 h-header border-b border-border-main bg-app-bg max-md:pl-14 max-md:pr-4">
      <h2 className="text-lg font-semibold text-text-main">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end max-md:hidden">
          <span className="text-[13px] font-medium text-text-main">{user?.name || "User"}</span>
          <span className="text-[11px] text-text-sub">{user?.email || ""}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand text-brand-text flex items-center justify-center text-[13px] font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}
