"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWindows, useCreateWindow } from "@/hooks/useWindows";

// ─── Helpers ───────────────────────────────────────
function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

// ─── Create Window Modal ───────────────────────────
const PRESET_COLORS = ["#6c5ce7", "#00d68f", "#ffaa00", "#ff4757", "#0984e3", "#e84393", "#00cec9", "#fd79a8"];

function CreateWindowModal({ onClose }) {
  const [name, setName] = useState("");
  const [allowance, setAllowance] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const createWindow = useCreateWindow();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Window name is required");

    setError(null);
    try {
      const labels = labelsInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      await createWindow.mutateAsync({
        name: name.trim(),
        color,
        ...(allowance && { allowance: parseFloat(allowance) }),
        ...(labels.length > 0 && { labels }),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create window");
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border-main rounded-xl p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold text-text-main mb-5">Create Window</h3>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food & Dining"
              className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Monthly Allowance</label>
            <input
              type="number"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Labels (comma separated)</label>
            <input
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="e.g. food, restaurant, zomato"
              className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
            />
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-sub mb-2">Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-all ${
                    color === c ? "border-text-main scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent">
              Cancel
            </button>
            <button type="submit" disabled={createWindow.isPending} className="px-5 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">
              {createWindow.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Window Card ───────────────────────────────────
function WindowCard({ window: w }) {
  const router = useRouter();
  const spent = Number(w.spent) || 0;
  const allowance = Number(w.allowance) || 0;
  const progress = allowance > 0 ? Math.min((spent / allowance) * 100, 100) : 0;
  const isOverBudget = spent > allowance && allowance > 0;

  return (
    <div
      onClick={() => router.push(`/windows/${w.id}`)}
      className="bg-panel-bg border border-border-main rounded-xl p-5 flex flex-col cursor-pointer hover:border-brand/40 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: w.color || "#6c5ce7" }} />
        <h3 className="text-sm font-semibold text-text-main truncate">{w.name}</h3>
        {w.isDefault && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/15 text-brand ml-auto shrink-0">
            Default
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-0.5">Allowance</span>
          <span className="text-sm font-semibold text-text-main">{formatAmount(allowance)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-0.5">Spent</span>
          <span className={`text-sm font-semibold ${isOverBudget ? "text-danger" : "text-text-main"}`}>{formatAmount(spent)}</span>
        </div>
      </div>

      {/* Progress bar */}
      {allowance > 0 && (
        <div className="w-full h-1.5 bg-hover-bg rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-danger" : "bg-brand"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Labels */}
      {w.labels && w.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {w.labels.slice(0, 5).map((label) => (
            <span key={label} className="px-2 py-0.5 bg-hover-bg rounded text-[11px] text-text-sub">{label}</span>
          ))}
          {w.labels.length > 5 && (
            <span className="px-2 py-0.5 text-[11px] text-text-disabled">+{w.labels.length - 5}</span>
          )}
        </div>
      )}

      {/* Transaction count */}
      <span className="text-[11px] text-text-disabled mt-2">{w.transactionCount || 0} transactions</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────
function WindowsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-panel-bg border border-border-main rounded-xl p-5 h-[180px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-hover-bg" />
            <div className="w-24 h-3.5 bg-hover-bg rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[1, 2].map((j) => (
              <div key={j}>
                <div className="w-14 h-2 bg-hover-bg rounded mb-2" />
                <div className="w-20 h-4 bg-hover-bg rounded" />
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-hover-bg rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────
export default function WindowsContent() {
  const { data, isLoading, isError, error, refetch } = useWindows();
  const windows = data || [];
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <WindowsSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-danger text-sm">{error?.message || "Failed to load windows"}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  const canCreate = windows.length < 4;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <p className="text-sm text-text-sub">{windows.length} window{windows.length !== 1 ? "s" : ""}</p>
          {!canCreate && (
            <span className="text-[10px] text-brand font-medium">Limit reached (max 4 windows)</span>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={!canCreate}
          title={!canCreate ? "You can only create up to 3 custom windows (total 4)" : "Create new window"}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Window
        </button>
      </div>

      {/* Windows Grid — clickable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {windows.map((w) => (
          <WindowCard key={w.id} window={w} />
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateWindowModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
