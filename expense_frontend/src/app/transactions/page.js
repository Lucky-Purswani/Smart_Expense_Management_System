import AppShell from "@/components/AppShell";
import TransactionsContent from "./TransactionsContent";

export const metadata = {
  title: "Transactions | Expense Manager",
};

// Server component — renders the client-side transactions list inside AppShell
export default function TransactionsPage() {
  return <AppShell><TransactionsContent /></AppShell>;
}
