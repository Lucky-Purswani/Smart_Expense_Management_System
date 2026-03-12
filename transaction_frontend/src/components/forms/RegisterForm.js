"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();

  // Steps: 1 = register form, 2 = OTP verification
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Step 1 — Register
  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, phone, password } = form;
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      return setError("All fields are required");
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return setError("Phone must be 10 digits");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) return setError("OTP must be 6 digits");

    setSubmitting(true);
    setError(null);

    try {
      await authApi.verifyOtp({ userId, otp });
      router.push("/login");
    } catch (err) {
      setError(err.message || "OTP verification failed");
      setSubmitting(false);
    }
  };

  // ─── OTP Step ──────────────────────────────────────
  if (step === 2) {
    return (
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
        <div className="text-center mb-2">
          <p className="text-sm text-text-secondary">
            We sent a 6-digit OTP to <strong className="text-text-primary">{form.email}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs">
            {error}
          </div>
        )}

        <Input
          label="OTP"
          id="otp"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          autoFocus
        />

        <Button type="submit" fullWidth className="mt-2" loading={submitting}>
          Verify OTP
        </Button>
      </form>
    );
  }

  // ─── Register Step ─────────────────────────────────
  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        id="name"
        placeholder="John Doe"
        value={form.name}
        onChange={update("name")}
        autoFocus
      />

      <Input
        label="Email"
        type="email"
        id="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={update("email")}
      />

      <Input
        label="Phone Number"
        type="tel"
        id="phone"
        placeholder="10-digit number"
        value={form.phone}
        onChange={update("phone")}
        maxLength={10}
      />

      <Input
        label="Password"
        type="password"
        id="password"
        placeholder="Min 6 characters"
        value={form.password}
        onChange={update("password")}
      />

      <Button type="submit" fullWidth className="mt-2" loading={submitting}>
        Create Account
      </Button>

      <p className="text-center text-sm text-text-secondary mt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
