import TransferForm from "@/components/forms/TransferForm";
import AccountSummary from "@/components/transfer/AccountSummary";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Transfer — TransactPay",
};

export default function TransferPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-text-primary mb-1">
        Make Transaction
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Process a payment or transfer money to another account
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form — takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <Card>
            <TransferForm />
          </Card>
        </div>

        {/* Account Summary — sidebar on desktop, below on mobile */}
        <div className="lg:col-span-1">
          <AccountSummary />
        </div>
      </div>
    </div>
  );
}
