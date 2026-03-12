import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password - TransactPay",
  description: "Request a password reset OTP",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-text-primary mb-1">
            Forgot Password?
          </h1>
          <p className="text-sm text-text-secondary">
            Enter your email to receive an OTP
          </p>
        </div>

        <div className="bg-panel-bg border border-border rounded-xl p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
