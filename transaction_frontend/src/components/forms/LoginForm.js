"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return setError("All fields are required");

    setSubmitting(true);
    setError(null);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      login(res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      setError(err.message || "Login failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        id="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      <div className="flex justify-end -mt-1">
        <Link href="/forgot-password" size="sm" className="text-xs text-accent hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth className="mt-1" loading={submitting}>
        Sign In
      </Button>

      <p className="text-center text-sm text-text-secondary mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
