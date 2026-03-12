import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Sign In — TransactPay",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-text-primary mb-1">
            Sign in to TransactPay
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your credentials to continue
          </p>
        </div>

        <div className="bg-panel-bg border border-border rounded-xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
