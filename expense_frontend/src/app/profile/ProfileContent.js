"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authApi, clearTokens } from "@/services/api";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

// ─── Helpers ───────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Section Wrapper ───────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-panel-bg border border-border-main rounded-xl p-5 mb-5">
      <h3 className="text-sm font-semibold text-text-sub uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-main last:border-b-0">
      <span className="text-xs font-medium text-text-disabled uppercase tracking-wider">{label}</span>
      <span className="text-sm text-text-main font-medium">{value || "—"}</span>
    </div>
  );
}

// ─── Edit Profile Modal ────────────────────────────
function EditProfileModal({ user, onClose }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const body = {};
      if (name.trim() && name.trim() !== user.name) body.name = name.trim();
      if (phone.trim() && phone.trim() !== user.phone) body.phone = phone.trim();
      if (Object.keys(body).length === 0) return onClose();
      
      await updateProfile.mutateAsync(body);
      onClose();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border-main rounded-xl p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold text-text-main mb-5">Edit Profile</h3>
        {error && <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors" autoFocus />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-sub mb-1.5">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" maxLength={10} className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-sub hover:text-text-main hover:bg-hover-bg transition-colors cursor-pointer border-none bg-transparent">Cancel</button>
            <button type="submit" disabled={updateProfile.isPending} className="px-5 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed">{updateProfile.isPending ? "Saving..." : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-panel-bg border border-border-main rounded-xl p-5 mb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between py-3 border-b border-border-main last:border-b-0">
            <div className="w-20 h-3 bg-hover-bg rounded" />
            <div className="w-32 h-3 bg-hover-bg rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Profile ──────────────────────────────────
export default function ProfileContent() {
  const router = useRouter();
  const { data: user, isLoading, isError, error, refetch } = useProfile();
  
  const [showEdit, setShowEdit] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Ignore — we logout locally regardless
    } finally {
      clearTokens();
      router.push("/auth/login");
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-danger text-sm">{error?.message || "Failed to load profile"}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Profile Info */}
      <Section title="Personal Information">
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Phone" value={user?.phone} />
        <InfoRow label="Member Since" value={formatDate(user?.createdAt)} />

        <button
          onClick={() => setShowEdit(true)}
          className="mt-4 px-4 py-2 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none"
        >
          Edit Profile
        </button>
      </Section>

      {/* Account Info */}
      <Section title="Account Details">
        <InfoRow label="Account Number" value={user?.accountNumber} />
        <InfoRow label="Account Holder" value={user?.accountHolderName} />
      </Section>

      {/* Security */}
      <Section title="Account Actions">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-5 py-2.5 text-sm font-semibold text-danger bg-danger/5 border border-danger/20 rounded-lg hover:bg-danger/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loggingOut ? "Logging out..." : "Sign Out"}
          </button>
        </div>
      </Section>

      {/* Modals */}
      {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
