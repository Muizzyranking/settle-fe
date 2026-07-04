import { LoginForm } from "@/components/auth/login-form";
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
      <LoginForm />
    </AuthShell>
  );
}
