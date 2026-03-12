import AppShell from "@/components/AppShell";
import WindowsContent from "./WindowsContent";

export const metadata = {
  title: "Expense Windows | Expense Manager",
};

// Server component — renders the client-side windows management inside AppShell
export default function WindowsPage() {
  return <AppShell><WindowsContent /></AppShell>;
}
