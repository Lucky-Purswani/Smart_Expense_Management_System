"use client";

import { useAccount } from "@/hooks/useProfile";
import Card from "@/components/ui/Card";

export default function AccountSummary() {
  const { data: account, isLoading } = useAccount();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 bg-hover-bg rounded w-1/2 mb-4" />
        <div className="h-8 bg-hover-bg rounded w-3/4" />
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
    <Card className="flex flex-col gap-6">
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Available Balance
        </h3>
        <p className="text-2xl font-bold text-text-primary">
          {formatCurrency(account?.balance)}
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-text-secondary">Account Holder</span>
          <span className="text-xs font-medium text-text-primary">{account?.user?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Account Number</span>
          <span className="text-xs font-mono font-medium text-text-primary">
            {account?.accountNumber}
          </span>
        </div>
      </div>

      <div className="bg-accent/5 p-3 rounded-lg border border-accent/10">
        <p className="text-[10px] leading-relaxed text-accent">
          Keep your account details secure. TransactPay will never ask for your PIN or OTP via email or call.
        </p>
      </div>
    </Card>
  );
}
