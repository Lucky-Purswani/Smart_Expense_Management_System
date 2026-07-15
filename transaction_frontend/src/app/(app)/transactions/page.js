import TransactionsContent from "./TransactionsContent";

export const metadata = {
  title: "Transactions — TransactPay",
};

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-text-primary mb-1">
        Transaction History
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        View all your past transactions
      </p>

      <TransactionsContent />
    </div>
  );
}
