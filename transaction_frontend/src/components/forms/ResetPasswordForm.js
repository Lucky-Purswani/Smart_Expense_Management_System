"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword || !confirmPassword) {
      return setError("All fields are required");
    }
    if (otp.length !== 6) return setError("OTP must be 6 digits");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setSubmitting(true);
    setError(null);

    try {
      await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-text-primary">Success!</h2>
        <p className="text-sm text-text-secondary mt-2">
          Your password has been reset. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs text-center">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={!!emailParam}
      />

      <Input
        label="6-Digit OTP"
        placeholder="000000"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        required
      />

      <div className="relative">
        <Input
          label="New Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-7.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" fullWidth className="mt-2" loading={submitting}>
        Reset Password
      </Button>

      <div className="text-center mt-2">
        <Link href="/login" className="text-xs text-accent hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordForm() {
    return (
        <Suspense fallback={<div className="text-center py-10 text-text-muted text-sm">Loading...</div>}>
            <ResetPasswordFormContent />
        </Suspense>
    );
}
