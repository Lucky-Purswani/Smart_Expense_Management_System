"use client";

import { useDashboard } from "@/hooks/useDashboard";
import Card from "@/components/Card";

// Format currency
function formatAmount(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
}

// Format date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format time
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Summary Cards ─────────────────────────────────
function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Wallet Balance",
      value: formatAmount(summary.walletBalance),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 10H2" />
        </svg>
      ),
      color: "text-brand",
    },
    {
      label: "Total Spent",
      value: formatAmount(summary.totalSpent),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      ),
      color: "text-danger",
    },
    {
      label: "Total Received",
      value: formatAmount(summary.totalReceived),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      ),
      color: "text-success",
    },
    {
      label: "Total Transactions",
      value: summary.totalTransactions,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-panel-bg border border-border-main rounded-xl p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-sub uppercase tracking-wider">
              {card.label}
            </span>
            <span className={card.color}>{card.icon}</span>
          </div>
          <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Window Breakdown ──────────────────────────────
function WindowBreakdown({ windows }) {
  if (!windows || windows.length === 0) {
    return (
      <Card title="Expense Windows">
        <p className="text-text-sub text-sm">No expense windows data available.</p>
      </Card>
    );
  }

  return (
    <Card title="Spending by Window">
      <div className="flex flex-col gap-4">
        {windows.map((w) => {
          const spent = Number(w.spent) || 0;
          const allowance = Number(w.allowance) || 0;
          const progress = allowance > 0 ? Math.min((spent / allowance) * 100, 100) : 0;
          const isOverBudget = spent > allowance && allowance > 0;

          return (
            <a
              key={w.id}
              href={`/windows/${w.id}`}
              className="flex flex-col gap-1.5 p-3 -mx-3 rounded-lg hover:bg-hover-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color || "#6c5ce7" }} />
                  <span className="text-sm font-medium text-text-main">{w.name}</span>
                </div>
                <span className={`text-sm font-semibold ${isOverBudget ? "text-danger" : "text-text-main"}`}>
                  {formatAmount(spent)} {!w.isDefault && <span className="text-text-disabled font-normal">/ {formatAmount(allowance)}</span>}
                </span>
              </div>
              {allowance > 0 && !w.isDefault && (
                <div className="w-full h-1.5 bg-hover-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-danger" : "bg-brand"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {w.labels && w.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {w.labels.slice(0, 4).map((l) => (
                    <span key={l} className="px-1.5 py-0.5 bg-hover-bg rounded text-[10px] text-text-disabled">{l}</span>
                  ))}
                  {w.labels.length > 4 && <span className="text-[10px] text-text-disabled">+{w.labels.length - 4}</span>}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </Card>
  );
}


// ─── Recent Transactions ───────────────────────────
function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card title="Recent Activity">
        <p className="text-text-sub text-sm">No recent transactions.</p>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      <div className="flex flex-col divide-y divide-border-main">
        {transactions.map((tx) => {
          const isDebit = tx.type === "DEBIT";
          return (
            <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {/* Type indicator */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isDebit ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                  }`}
                >
                  {isDebit ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-main">
                    {tx.recipient || "Unknown"}
                  </span>
                  <span className="text-xs text-text-sub">
                    {formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}
                  </span>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  isDebit ? "text-danger" : "text-success"
                }`}
              >
                {isDebit ? "-" : "+"}{formatAmount(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Loading Skeleton ──────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Summary skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-panel-bg border border-border-main rounded-xl p-5 h-[100px]">
            <div className="w-24 h-3 bg-hover-bg rounded mb-4" />
            <div className="w-32 h-6 bg-hover-bg rounded" />
          </div>
        ))}
      </div>
      {/* Window + Transactions skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-panel-bg border border-border-main rounded-xl p-5 h-[200px]">
          <div className="w-32 h-3 bg-hover-bg rounded mb-6" />
          <div className="space-y-4">
            <div className="w-full h-2 bg-hover-bg rounded" />
            <div className="w-3/4 h-2 bg-hover-bg rounded" />
            <div className="w-1/2 h-2 bg-hover-bg rounded" />
          </div>
        </div>
        <div className="bg-panel-bg border border-border-main rounded-xl p-5 h-[200px]">
          <div className="w-32 h-3 bg-hover-bg rounded mb-6" />
          <div className="space-y-4">
            <div className="w-full h-4 bg-hover-bg rounded" />
            <div className="w-full h-4 bg-hover-bg rounded" />
            <div className="w-full h-4 bg-hover-bg rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────
export default function DashboardContent() {
  const { summary, windowBreakdown, recentActivity, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-danger text-sm">{error?.message || "Failed to load dashboard data"}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Window Breakdown + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WindowBreakdown windows={windowBreakdown} />
        <RecentTransactions transactions={recentActivity} />
      </div>
    </div>
  );
}
