import TransferForm from "@/components/forms/TransferForm";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Transfer — TransactPay",
};

export default function TransferPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-1">
        Make Transaction
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Process a payment or transfer money to another account
      </p>

      <Card>
        <TransferForm />
      </Card>
    </div>
  );
}
