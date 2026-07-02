import { AuthAction, AuthField, AuthSwitchLink } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Create account"
      title="Start collecting cleanly"
      subtitle="Set up your business workspace. We will send an email verification link before the account is activated."
      visual="setup"
      variant="reverse"
    >
      <form className="space-y-5">
        <AuthField
          label="Business name"
          name="businessName"
          placeholder="Sunshine Estates"
          autoComplete="organization"
        />
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@business.com"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <AuthAction href="/check-email">Create account</AuthAction>
      </form>

      <AuthSwitchLink prompt="Already have an account?" href="/login" label="Log in" />
    </AuthShell>
  );
}
