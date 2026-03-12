import ProfileContent from "./ProfileContent";

export const metadata = {
  title: "Profile — TransactPay",
};

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-1">Profile</h1>
      <p className="text-sm text-text-secondary mb-6">
        Manage your account information
      </p>

      <ProfileContent />
    </div>
  );
}
