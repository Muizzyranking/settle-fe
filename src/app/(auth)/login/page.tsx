import { AuthAction, AuthField, AuthSwitchLink } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to Settle"
      subtitle="Open your collection workspace and keep tracking payments without the spreadsheet."
      visual="payments"
      variant="split"
    >
      <form className="space-y-5">
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
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <AuthAction href="/dashboard">Log in</AuthAction>
      </form>

      <AuthSwitchLink prompt="New to Settle?" href="/register" label="Create an account" />
    </AuthShell>
  );
}
