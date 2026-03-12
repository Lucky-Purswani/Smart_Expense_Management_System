"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const { login, error, submitting, clearError, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-border-main border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    await login(email, password);
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-panel-bg border border-border-main rounded-xl p-10 max-sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-[52px] h-[52px] bg-brand text-brand-text rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-text-main mb-1.5">Expense Manager</h1>
          <p className="text-sm text-text-sub">Sign in to your account</p>
        </div>

        {/* Server Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 bg-danger-panel border border-danger/25 rounded-md text-danger text-[13px] mb-6" role="alert">
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-[13px] font-medium text-text-sub mb-2">Email</label>
            <div className={`flex items-center gap-2.5 bg-input-bg border rounded-md px-3.5 transition-colors duration-150 focus-within:border-brand ${fieldErrors.email ? "border-danger" : "border-border-main"}`}>
              <svg className="text-text-disabled shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
                }}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={submitting}
                className="flex-1 bg-transparent border-none outline-none text-text-main text-sm py-3 placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {fieldErrors.email && <span className="block text-xs text-danger mt-1.5">{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-[13px] font-medium text-text-sub mb-2">Password</label>
            <div className={`flex items-center gap-2.5 bg-input-bg border rounded-md px-3.5 transition-colors duration-150 focus-within:border-brand ${fieldErrors.password ? "border-danger" : "border-border-main"}`}>
              <svg className="text-text-disabled shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={submitting}
                className="flex-1 bg-transparent border-none outline-none text-text-main text-sm py-3 placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                className="bg-transparent border-none cursor-pointer text-text-disabled hover:text-text-sub p-1 flex items-center transition-colors duration-150"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <span className="block text-xs text-danger mt-1.5">{fieldErrors.password}</span>}
          </div>


          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 mt-7 bg-brand text-brand-text border-none rounded-md text-sm font-medium cursor-pointer hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-text/30 border-t-brand-text rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
