"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Step 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required");

    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("OTP must be 6 digits");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({ email: email.trim(), otp, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-panel-bg border border-border-main rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-main mb-1">
            {success ? "Password Reset!" : step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-sm text-text-sub mb-6">
            {success
              ? "Redirecting to login..."
              : step === 1
              ? "Enter your email to receive a reset OTP."
              : "Enter the OTP sent to your email and your new password."}
          </p>

          {success ? (
            <div className="p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm text-center">
              Password reset successful! Redirecting...
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs mb-4">{error}</div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-text-sub mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-text-sub mb-1.5">OTP (6 digits)</label>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-lg text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled tracking-widest text-center"
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-text-sub mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-text-sub mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-input-bg border border-border-main rounded-md px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand text-brand-text rounded-md text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-xs text-brand hover:underline cursor-pointer bg-transparent border-none"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
