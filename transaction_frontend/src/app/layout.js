import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "TransactPay",
  description: "Send money and manage transactions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-app-bg text-text-primary min-h-screen">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
