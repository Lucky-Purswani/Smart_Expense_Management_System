"use client";

import { useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import { useTransactions } from "@/hooks/useTransactions";

// ─── Helpers ───────────────────────────────────────
function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Filter Tabs ───────────────────────────────────

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Sent", value: "DEBIT" },
  { label: "Received", value: "CREDIT" },
];

function FilterTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 bg-input-bg border border-border rounded-lg p-1 w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer border-none ${
            active === f.value
              ? "bg-accent text-accent-text shadow-sm"
              : "bg-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ─── Transaction Row ───────────────────────────────

function TransactionRow({ tx }) {
  const isDebit = tx.type === "DEBIT";

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-b-0 group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isDebit ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
          }`}
        >
          {isDebit ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {tx.recipient || tx.note || "Transaction"}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span>{formatDate(tx.createdAt)}</span>
            <span className="text-text-muted">·</span>
            <span>{formatTime(tx.createdAt)}</span>
          </div>
        </div>
      </div>

      {tx.note && (
        <span className="hidden md:block flex-1 px-4 text-xs text-text-muted truncate text-right">
          {tx.note}
        </span>
      )}

      <span
        className={`text-sm font-semibold whitespace-nowrap ml-3 tabular-nums ${
          isDebit ? "text-danger" : "text-success"
        }`}
      >
        {isDebit ? "-" : "+"}{formatAmount(tx.amount)}
      </span>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────

function TransactionSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3.5 border-b border-border last:border-b-0">
          <div className="w-8 h-8 rounded-lg bg-hover-bg shrink-0" />
          <div className="flex-1">
            <div className="w-28 h-3.5 bg-hover-bg rounded mb-1.5" />
            <div className="w-20 h-2.5 bg-hover-bg rounded" />
          </div>
          <div className="w-20 h-3.5 bg-hover-bg rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Content ──────────────────────────────────

export default function TransactionsContent() {
  const [filter, setFilter] = useState("ALL");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useTransactions();

  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.transactions) || [];
  }, [data]);

  const filtered = useMemo(() => {
    return filter === "ALL"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  if (isError && transactions.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center text-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-danger text-sm">{error?.message || "Failed to load transactions"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent text-accent-text rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer border-none"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <FilterTabs active={filter} onChange={setFilter} />

      {/* Transactions List */}
      <Card>
        {isLoading ? (
          <TransactionSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <div className="w-10 h-10 bg-hover-bg rounded-full flex items-center justify-center text-text-muted mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              {filter === "ALL" ? "No transactions yet." : `No ${filter === "DEBIT" ? "sent" : "received"} transactions.`}
            </p>
          </div>
        ) : (
          <>
            {filtered.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}

            {/* Load More */}
            {filter === "ALL" && hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 mt-2 flex justify-center hover:bg-hover-bg transition-colors rounded-lg group border-none bg-transparent cursor-pointer"
              >
                {isFetchingNextPage ? (
                  <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs font-medium text-text-muted group-hover:text-text-primary transition-colors uppercase tracking-wider">
                    Load More
                  </span>
                )}
              </button>
            )}

            {filter === "ALL" && !hasNextPage && transactions.length > 0 && (
              <p className="text-text-muted text-xs text-center py-4 border-t border-border/50 mt-2">
                All transactions loaded
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
