"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWindow, useUpdateWindow, useDeleteWindow, useAddLabels, useRemoveLabels, useResetWindow } from "@/hooks/useWindows";
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
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── Edit Window Modal ─────────────────────────────
function EditWindowModal({ window: w, onClose }) {
  const [name, setName] = useState(w.name || "");
  const [allowance, setAllowance] = useState(w.allowance?.toString() || "");
  const [resetDay, setResetDay] = useState(w.resetDay?.toString() || "");
  const updateWindow = useUpdateWindow();
  const resetMutation = useResetWindow();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Update basic info if changed
      const body = {};
      if (name.trim() && name.trim() !== w.name) body.name = name.trim();
      if (allowance && parseFloat(allowance) !== Number(w.allowance)) body.allowance = parseFloat(allowance);
      
      if (Object.keys(body).length > 0) {
        await updateWindow.mutateAsync({ id: w.id, data: body });
      }

      // 2. Update reset day if changed
      if (resetDay !== (w.resetDay?.toString() || "")) {
        const day = resetDay ? parseInt(resetDay) : null;
        if (day && (day < 1 || day > 28)) throw new Error("Reset day must be 1-28");
        await resetMutation.mutateAsync({ id: w.id, resetDay: day });
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update");
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border-main rounded-xl p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold text-text-main mb-5">Edit Window</h3>
        {error && <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors" autoFocus />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Monthly Allowance</label>
            <input type="number" value={allowance} onChange={(e) => setAllowance(e.target.value)} min="0" step="0.01" className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Monthly Reset Day (1-28)</label>
            <input type="number" value={resetDay} onChange={(e) => setResetDay(e.target.value)} min="1" max="28" placeholder="e.g. 1" className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors" />
            <p className="mt-1 text-[10px] text-text-disabled italic">Window stats will reset automatically on this day every month.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
            <button type="submit" disabled={updateWindow.isPending} className="px-5 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">{updateWindow.isPending ? "Saving..." : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ───────────────────────────
function DeleteConfirmModal({ windowName, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-panel-bg border border-border-main rounded-xl p-6 w-full max-sm z-10">
        <h3 className="text-base font-semibold text-text-main mb-2">Delete Window</h3>
        <p className="text-sm text-text-sub mb-5">
          Delete <strong className="text-text-main">{windowName}</strong>? All its transactions will be moved to the default window.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-danger text-brand-text rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">{deleting ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Confirmation ───────────────────────────
function ResetConfirmModal({ currentResetDay, onConfirm, onCancel }) {
  const [mode, setMode] = useState("instant"); // "instant" or "schedule"
  const [resetDay, setResetDay] = useState(currentResetDay?.toString() || "");
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);

  const handleAction = async (action) => {
    setError(null);
    setResetting(true);
    try {
      if (action === "instant") {
        await onConfirm(); // resetDay will be undefined
      } else if (action === "schedule") {
        const day = parseInt(resetDay);
        if (!resetDay || isNaN(day) || day < 1 || day > 28) {
          throw new Error("Please enter a valid day between 1 and 28");
        }
        await onConfirm({ resetDay: day });
      } else if (action === "remove") {
        await onConfirm({ resetDay: null });
      }
    } catch (err) {
      setError(err.message || "Action failed");
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-panel-bg border border-border-main rounded-xl p-6 w-full max-w-sm z-10">
        <h3 className="text-lg font-semibold text-text-main mb-4">Reset Window</h3>
        
        {error && <div className="p-2 bg-danger/10 border border-danger/20 rounded text-danger text-xs mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex bg-hover-bg p-1 rounded-lg mb-6">
          <button 
            onClick={() => setMode("instant")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border-none ${mode === "instant" ? "bg-panel-bg text-text-main shadow-sm" : "text-text-sub hover:text-text-main"}`}
          >
            Reset Now
          </button>
          <button 
            onClick={() => setMode("schedule")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border-none ${mode === "schedule" ? "bg-panel-bg text-text-main shadow-sm" : "text-text-sub hover:text-text-main"}`}
          >
            Monthly Schedule
          </button>
        </div>

        {mode === "instant" ? (
          <div>
            <p className="text-sm text-text-sub mb-6">
              This will immediately clear current stats (Spent & Count) for this window. Historical transactions will remain assigned to this window.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
              <button onClick={() => handleAction("instant")} disabled={resetting} className="px-5 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">
                {resetting ? "Resetting..." : "Reset Now"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-text-sub mb-2">Monthly Reset Day (1-28)</label>
              <input 
                type="number" 
                value={resetDay} 
                onChange={(e) => setResetDay(e.target.value)}
                min="1" 
                max="28" 
                placeholder="e.g. 1" 
                className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
              />
              <p className="mt-2 text-[10px] text-text-disabled italic">
                Statistics will automatically return to zero on this day every month.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent mr-auto">Cancel</button>
              {currentResetDay && (
                <button 
                  onClick={() => handleAction("remove")} 
                  disabled={resetting} 
                  className="px-4 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer border border-danger/20"
                >
                  Remove Schedule
                </button>
              )}
              <button onClick={() => handleAction("schedule")} disabled={resetting} className="px-5 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">
                {resetting ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transaction Row ───────────────────────────────
function TransactionRow({ tx }) {
  const isDebit = tx.type === "DEBIT";
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border-main last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isDebit ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
          {isDebit ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-main truncate">{tx.recipient || "Unknown"}</span>
          <div className="flex items-center gap-2 text-xs text-text-sub">
            <span>{formatDate(tx.createdAt)}</span>
            <span className="text-text-disabled">·</span>
            <span>{formatTime(tx.createdAt)}</span>
          </div>
        </div>
      </div>
      {tx.note && <span className="hidden md:block flex-1 px-4 text-xs text-text-sub truncate">{tx.note}</span>}
      <span className={`text-sm font-semibold whitespace-nowrap ${isDebit ? "text-danger" : "text-success"}`}>
        {isDebit ? "-" : "+"}{formatAmount(tx.amount)}
      </span>
    </div>
  );
}

// ─── Main Detail Content ───────────────────────────
export default function WindowDetailContent() {
  const { id } = useParams();
  const router = useRouter();

  const { data: windowData, isLoading: windowLoading, isError: windowError, error: windowFetchError, refetch: refetchWindow } = useWindow(id);
  const deleteWindow = useDeleteWindow();
  const resetWindow = useResetWindow();
  const addLabels = useAddLabels();
  const removeLabels = useRemoveLabels();

  const {
    data: txData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: txLoading,
    refetch: refetchTransactions
  } = useTransactions(15, id);

  const transactions = useMemo(() => {
    return txData?.pages.flatMap((page) => page.transactions) || [];
  }, [txData]);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;
    try {
      await addLabels.mutateAsync({ id, labels: [newLabel.trim()] });
      setNewLabel("");
    } catch { }
  };

  const handleRemoveLabel = async (label) => {
    try {
      await removeLabels.mutateAsync({ id, labels: [label] });
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteWindow.mutateAsync(id);
      router.push("/windows");
    } catch { }
  };

  const handleManualReset = async ({ resetDay } = {}) => {
    try {
      await resetWindow.mutateAsync({ id, resetDay });
      setShowReset(false);
    } catch { }
  };

  const isLoading = windowLoading || (txLoading && transactions.length === 0);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="w-40 h-5 bg-hover-bg rounded mb-6" />
        <div className="bg-panel-bg border border-border-main rounded-xl p-5 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => <div key={i}><div className="w-16 h-2 bg-hover-bg rounded mb-2" /><div className="w-24 h-5 bg-hover-bg rounded" /></div>)}
          </div>
          <div className="w-full h-2 bg-hover-bg rounded-full" />
        </div>
        <div className="bg-panel-bg border border-border-main rounded-xl p-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="flex justify-between py-3 border-b border-border-main"><div className="flex gap-3"><div className="w-9 h-9 bg-hover-bg rounded-lg" /><div><div className="w-28 h-3 bg-hover-bg rounded mb-1.5" /><div className="w-20 h-2 bg-hover-bg rounded" /></div></div><div className="w-20 h-4 bg-hover-bg rounded" /></div>)}
        </div>
      </div>
    );
  }

  if (windowError || !windowData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-danger text-sm">{windowFetchError?.message || "Window not found"}</p>
        <button onClick={() => router.push("/windows")} className="px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer">
          Back to Windows
        </button>
      </div>
    );
  }

  const spent = Number(windowData.spent) || 0;
  const allowance = Number(windowData.allowance) || 0;
  const remaining = allowance - spent;
  const progress = allowance > 0 ? Math.min((spent / allowance) * 100, 100) : 0;
  const isOverBudget = spent > allowance && allowance > 0;

  return (
    <div>
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/windows")} className="p-1.5 text-text-sub hover:text-text-main hover:bg-hover-bg rounded transition-colors cursor-pointer bg-transparent border-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: windowData.color || "#6c5ce7" }} />
          <h2 className="text-lg font-semibold text-text-main">{windowData.name}</h2>
          {windowData.isDefault && <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/15 text-brand">Default</span>}
        </div>
        {/* Edit / Delete / Reset */}
        {!windowData.isDefault && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowReset(true)} title="Reset Stats Now" className="p-1.5 text-text-sub hover:text-brand hover:bg-brand/5 rounded transition-colors cursor-pointer bg-transparent border border-border-main">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
            </button>
            <button onClick={() => setShowEdit(true)} className="px-3 py-1.5 text-xs font-medium text-text-sub hover:text-text-main hover:bg-hover-bg rounded-md transition-colors cursor-pointer bg-transparent border border-border-main">Edit</button>
            <button onClick={() => setShowDelete(true)} className="px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer bg-transparent border border-danger/30">Delete</button>
          </div>
        )}
      </div>

      {/* Overview Card */}
      <div className="bg-panel-bg border border-border-main rounded-xl p-5 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-0.5">Allowance</span>
            <span className="text-lg font-bold text-text-main">{formatAmount(allowance)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-0.5">Spent</span>
            <span className={`text-lg font-bold ${isOverBudget ? "text-danger" : "text-text-main"}`}>{formatAmount(spent)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-0.5">Remaining</span>
            <span className={`text-lg font-bold ${remaining < 0 ? "text-danger" : "text-success"}`}>{formatAmount(remaining)}</span>
          </div>
        </div>

        {windowData.resetDay && (
          <div className="flex items-center gap-1.5 mb-4 text-[10px] text-brand font-medium uppercase tracking-wider bg-brand/5 w-fit px-2 py-1 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Auto-reset on day {windowData.resetDay} of the month
          </div>
        )}

        {/* Progress bar */}
        {allowance > 0 && (
          <div className="w-full h-2 bg-hover-bg rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-danger" : "bg-brand"}`} style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Labels Section */}
        {!windowData.isDefault && (
          <div className="pt-4 border-t border-border-main">
            <span className="block text-[10px] font-semibold uppercase text-text-disabled tracking-wider mb-2">Labels</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(windowData.labels || []).map((label) => (
                <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 bg-hover-bg rounded text-xs text-text-sub">
                  {label}
                  <button onClick={() => handleRemoveLabel(label)} className="text-text-disabled hover:text-danger cursor-pointer bg-transparent border-none p-0 text-xs leading-none" title="Remove">×</button>
                </span>
              ))}
              {(!windowData.labels || windowData.labels.length === 0) && <span className="text-xs text-text-disabled">No labels yet</span>}
            </div>
            <div className="flex gap-1.5">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                placeholder="Add label..."
                className="flex-1 bg-input-bg border border-border-main rounded px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
              />
              <button
                onClick={handleAddLabel}
                disabled={addLabels.isPending || !newLabel.trim()}
                className="px-2.5 py-1.5 bg-brand text-brand-text rounded text-xs font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLabels.isPending ? "..." : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-panel-bg border border-border-main rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-sub uppercase tracking-wide mb-4">Transactions</h3>

        {transactions.length === 0 ? (
          <p className="text-text-sub text-sm py-8 text-center">No transactions in this window.</p>
        ) : (
          <>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}

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

      {/* Modals */}
      {showEdit && <EditWindowModal window={windowData} onClose={() => setShowEdit(false)} />}
      {showDelete && <DeleteConfirmModal windowName={windowData.name} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
      {showReset && <ResetConfirmModal currentResetDay={windowData.resetDay} onConfirm={handleManualReset} onCancel={() => setShowReset(false)} />}
    </div>
  );
}
