"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required");

    setSubmitting(true);
    setError(null);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs text-center">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        id="email"
        placeholder="alex@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
        required
      />

      <Button type="submit" fullWidth className="mt-1" loading={submitting}>
        Send Reset OTP
      </Button>

      <div className="flex items-center justify-center mt-2">
        <Link href="/login" className="text-xs text-accent hover:underline">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
