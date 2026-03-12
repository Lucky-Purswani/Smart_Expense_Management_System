import AppShell from "@/components/AppShell";
import ProfileContent from "./ProfileContent";

export const metadata = {
  title: "Profile | Expense Manager",
};

// Server component — renders the client-side profile management inside AppShell
export default function ProfilePage() {
  return <AppShell><ProfileContent /></AppShell>;
}
