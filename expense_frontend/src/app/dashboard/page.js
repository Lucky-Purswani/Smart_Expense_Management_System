import AppShell from "@/components/AppShell";
import DashboardContent from "./DashboardContent";

export const metadata = {
  title: "Dashboard | Expense Manager",
};

// Server component — renders the client-side dashboard inside AppShell
export default function DashboardPage() {
  return <AppShell><DashboardContent /></AppShell>;
}
