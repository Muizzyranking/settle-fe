import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

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
      <RegisterForm />
    </AuthShell>
  );
}
