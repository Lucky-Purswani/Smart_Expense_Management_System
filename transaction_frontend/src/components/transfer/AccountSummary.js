"use client";

import { useAccount, useProfile } from "@/hooks/useProfile";
import Card from "@/components/ui/Card";

export default function AccountSummary() {
  const { data: account, isLoading: accountLoading } = useAccount();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (accountLoading || profileLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-3 bg-hover-bg rounded w-1/2 mb-4" />
        <div className="h-7 bg-hover-bg rounded w-3/4" />
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          Available Balance
        </h3>
        <p className="text-2xl font-bold text-text-primary tabular-nums">
          {formatCurrency(account?.balance)}
        </p>
      </div>

      <div className="pt-4 border-t border-border flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Account Holder</span>
          <span className="text-xs font-medium text-text-primary">{profile?.name || "—"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Account Number</span>
          <span className="text-xs font-mono font-medium text-text-primary">
            {account?.accountNumber || "—"}
          </span>
        </div>
      </div>

      <div className="bg-accent/5 p-3 rounded-lg border border-accent/10">
        <p className="text-[11px] leading-relaxed text-accent/80">
          Keep your account details secure. TransactPay will never ask for your PIN or OTP via email or call.
        </p>
      </div>
    </Card>
  );
}
