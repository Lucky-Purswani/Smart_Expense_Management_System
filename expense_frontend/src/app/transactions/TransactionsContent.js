"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useWindows } from "@/hooks/useWindows";

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

// ─── Transaction Row ───────────────────────────────
function TransactionRow({ tx }) {
  const isDebit = tx.type === "DEBIT";

  return (
    <div className="flex items-center justify-between py-4 border-b border-border-main last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Type icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isDebit ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
          }`}
        >
          {isDebit ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-main truncate">
            {tx.recipient || "Unknown"}
          </span>
          <div className="flex items-center gap-2 text-xs text-text-sub">
            <span>{formatDate(tx.createdAt)}</span>
            <span className="text-text-disabled">·</span>
            <span>{formatTime(tx.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Note - visible on md+ */}
      <div className="hidden md:block flex-1 px-4">
        {tx.note && (
          <span className="text-xs text-text-sub truncate block">{tx.note}</span>
        )}
      </div>

      {/* Amount */}
      <span
        className={`text-sm font-semibold whitespace-nowrap ${
          isDebit ? "text-danger" : "text-success"
        }`}
      >
        {isDebit ? "-" : "+"}{formatAmount(tx.amount)}
      </span>
    </div>
  );
}

// ─── Skeleton Rows ─────────────────────────────────
function SkeletonRows({ count = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-border-main">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hover-bg" />
            <div className="flex flex-col gap-1.5">
              <div className="w-28 h-3.5 bg-hover-bg rounded" />
              <div className="w-20 h-2.5 bg-hover-bg rounded" />
            </div>
          </div>
          <div className="w-20 h-4 bg-hover-bg rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Filter Bar ────────────────────────────────────
function FilterBar({ typeFilter, setTypeFilter, windowFilter, setWindowFilter, windows }) {
  const types = [
    { value: "ALL", label: "All" },
    { value: "DEBIT", label: "Debit" },
    { value: "CREDIT", label: "Credit" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* Type filter */}
      <div className="flex rounded-lg overflow-hidden border border-border-main">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-none
              ${typeFilter === t.value
                ? "bg-brand text-brand-text"
                : "bg-panel-bg text-text-sub hover:bg-hover-bg hover:text-text-main"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Window filter */}
      {windows && windows.length > 0 && (
        <select
          value={windowFilter}
          onChange={(e) => setWindowFilter(e.target.value)}
          className="bg-panel-bg border border-border-main rounded-lg px-3 py-2 text-xs font-medium text-text-main outline-none cursor-pointer focus:border-brand transition-colors"
        >
          <option value="">All Windows</option>
          {windows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ─── Main Transactions Content ─────────────────────
export default function TransactionsContent() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [windowFilter, setWindowFilter] = useState("");

  const { data: windowsData } = useWindows();
  const windows = windowsData || [];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useTransactions(15, windowFilter);

  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.transactions) || [];
  }, [data]);

  const filteredTransactions = useMemo(() => {
    if (typeFilter === "ALL") return transactions;
    return transactions.filter((tx) => tx.type === typeFilter);
  }, [transactions, typeFilter]);

  if (isError && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-danger text-sm">{error?.message || "Failed to load transactions"}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Filters */}
      <FilterBar
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        windowFilter={windowFilter}
        setWindowFilter={setWindowFilter}
        windows={windows}
      />

      {/* Transaction List */}
      <div className="bg-panel-bg border border-border-main rounded-xl p-5">
        {isLoading ? (
          <SkeletonRows count={8} />
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-sub text-sm">No transactions found.</p>
          </div>
        ) : (
          <>
            {filteredTransactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-6 pb-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2 bg-hover-bg text-text-main text-xs font-semibold rounded-lg hover:bg-border-main transition-colors disabled:opacity-50 cursor-pointer border-none"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More Activity"}
                </button>
              </div>
            )}

            {!hasNextPage && transactions.length > 0 && (
              <p className="text-center text-text-disabled text-[11px] uppercase tracking-wider font-medium py-6">
                No more records to show
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
