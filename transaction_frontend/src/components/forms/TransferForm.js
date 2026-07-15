"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useTransferMoney } from "@/hooks/useTransfer";

const MODES = {
  PAYMENT: "PAYMENT",
  TRANSFER: "TRANSFER",
};

export default function TransferForm() {
  const [mode, setMode] = useState(MODES.PAYMENT);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createTransaction = useCreateTransaction();
  const transferMoney = useTransferMoney();

  const [form, setForm] = useState({
    recipient: "",
    accountNumber: "",
    amount: "",
    note: "",
  });

  const update = (field) => (e) => {
    setError(null);
    setSuccess(null);
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isPayment = mode === MODES.PAYMENT;
    const mutation = isPayment ? createTransaction : transferMoney;

    try {
      if (isPayment) {
        if (!form.recipient || !form.amount || !form.note) {
          throw new Error("All fields are required for payment");
        }
        await mutation.mutateAsync({
          amount: parseFloat(form.amount),
          note: form.note,
          type: "DEBIT",
          recipient: form.recipient,
        });
        setSuccess("Payment processed successfully");
      } else {
        if (!form.accountNumber || !form.amount || !form.note) {
          throw new Error("All fields are required for transfer");
        }
        await mutation.mutateAsync({
          accountNumber: form.accountNumber,
          amount: parseFloat(form.amount),
          note: form.note,
        });
        setSuccess("Money transferred successfully");
      }
      
      setForm({
        recipient: "",
        accountNumber: "",
        amount: "",
        note: "",
      });
    } catch (err) {
      setError(err.message || "Transaction failed");
    }
  };

  const isPending = createTransaction.isPending || transferMoney.isPending;

  return (
    <div className="flex flex-col gap-5">
      {/* Mode Toggle */}
      <div className="flex p-1 bg-input-bg border border-border rounded-lg">
        <button
          onClick={() => { setMode(MODES.PAYMENT); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 border-none cursor-pointer ${
            mode === MODES.PAYMENT ? "bg-accent text-accent-text shadow-sm" : "bg-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Make a Payment
        </button>
        <button
          onClick={() => { setMode(MODES.TRANSFER); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 border-none cursor-pointer ${
            mode === MODES.TRANSFER ? "bg-accent text-accent-text shadow-sm" : "bg-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Transfer Money
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {success}
          </div>
        )}

        {mode === MODES.PAYMENT ? (
          <Input
            label="Recipient Name"
            id="recipient"
            placeholder="e.g. Electricity Bill"
            value={form.recipient}
            onChange={update("recipient")}
            autoFocus
          />
        ) : (
          <Input
            label="Recipient Account Number"
            id="accountNumber"
            placeholder="Enter account number"
            value={form.accountNumber}
            onChange={update("accountNumber")}
            autoFocus
          />
        )}

        <Input
          label="Amount (₹)"
          type="number"
          id="amount"
          placeholder="0.00"
          value={form.amount}
          onChange={update("amount")}
        />

        <Input
          label="Note"
          id="note"
          placeholder="What's this for?"
          value={form.note}
          onChange={update("note")}
        />

        <Button type="submit" fullWidth className="mt-1" loading={isPending}>
          {mode === MODES.PAYMENT ? "Confirm Payment" : "Send Money"}
        </Button>
      </form>
    </div>
  );
}
