export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-app-bg">
      {children}
    </div>
  );
}
