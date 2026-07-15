import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Register — TransactPay",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <span className="text-accent-text text-base font-bold">T</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-1">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Start sending money in minutes
          </p>
        </div>

        <div className="bg-panel-bg border border-border rounded-xl p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
