import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

export const metadata = {
  title: "Reset Password - TransactPay",
  description: "Set a new password using your OTP",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-text-primary mb-1">
            Reset Password
          </h1>
          <p className="text-sm text-text-secondary">
            Set your new password using the OTP
          </p>
        </div>

        <div className="bg-panel-bg border border-border rounded-xl p-5">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
