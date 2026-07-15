"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { userApi, authApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile, useAccount, useUpdateProfile } from "@/hooks/useProfile";

// ─── Info Row ──────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value || "—"}</span>
    </div>
  );
}

// ─── Section ───────────────────────────────────────
function Section({ title, children }) {
  return (
    <Card title={title} className="mb-4">
      {children}
    </Card>
  );
}

// ─── Edit Profile Modal ────────────────────────────
function EditProfileModal({ user, onClose }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return setError("All fields are required");
    
    setError(null);
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border rounded-xl p-6 w-full max-w-md z-10">
        <h3 className="text-base font-semibold text-text-primary mb-5">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">{error}</p>}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" maxLength={10} />
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" onClick={onClose} disabled={updateProfile.isPending}>Cancel</Button>
            <Button type="submit" loading={updateProfile.isPending}>Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Modal ─────────────────────────
function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError("Passwords do not match");
    if (newPassword.length < 6) return setError("New password must be at least 6 characters");

    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword({ oldPassword: current, newPassword });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message || "Failed to change password");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border rounded-xl p-6 w-full max-w-md z-10">
        <h3 className="text-base font-semibold text-text-primary mb-5">Change Password</h3>
        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-success text-sm font-medium">Password changed successfully!</p>
            <p className="text-text-muted text-xs mt-1">Closing...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">{error}</p>}
            <Input label="Current Password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <div className="flex gap-3 justify-end mt-2">
              <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button type="submit" loading={loading}>Change Password</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Account Modal ──────────────────────────
function DeleteAccountModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await userApi.deleteAccount({ password });
      await logout();
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel-bg border border-border rounded-xl p-6 w-full max-w-sm z-10">
        <h3 className="text-base font-semibold text-danger mb-2">Delete Account</h3>
        <p className="text-sm text-text-secondary mb-5">
          This action is <strong className="text-danger">permanent</strong>. Enter your password to confirm.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="flex flex-col gap-4">
          {error && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">{error}</p>}
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="danger" type="submit" loading={loading} disabled={!password.trim()}>Delete Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Profile Content ──────────────────────────
export default function ProfileContent() {
  const { data: user, isLoading: profileLoading, isError, error } = useProfile();
  const { data: account, isLoading: accountLoading } = useAccount();
  
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  const { logout } = useAuth();

  if (profileLoading || accountLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center">
        <p className="text-danger text-sm">{error?.message || "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Personal Information */}
      <Section title="Personal Information">
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Phone" value={user?.phone} />
        <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
        <Button onClick={() => setShowEdit(true)} className="mt-4">
          Edit Profile
        </Button>
      </Section>

      {/* Account Details */}
      <Section title="Account Details">
        <div className="flex items-baseline justify-between py-3 border-b border-border">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Balance</span>
          <span className="text-xl font-bold text-text-primary tabular-nums">
            {account?.balance
              ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(account.balance))
              : "₹0.00"}
          </span>
        </div>
        <InfoRow label="Account Number" value={account?.accountNumber} />
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setShowChangePassword(true)}>
            Change Password
          </Button>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone">
        <p className="text-xs text-text-secondary mb-3">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteAccount(true)}>
          Delete Account
        </Button>
      </Section>

      {/* Modals */}
      {showEdit && (
        <EditProfileModal 
          user={user} 
          onClose={() => setShowEdit(false)} 
        />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
      {showDeleteAccount && (
        <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
}
