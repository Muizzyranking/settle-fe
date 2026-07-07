type PasswordStrength = {
  score: number;
  label: string;
  className: string;
  checks: Array<{ label: string; passed: boolean }>;
};

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-medium text-[var(--color-error)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Symbol", passed: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((check) => check.passed).length;

  if (score <= 2) {
    return {
      score,
      checks,
      label: "Weak",
      className: "bg-[#B91C1C]",
    };
  }

  if (score <= 4) {
    return {
      score,
      checks,
      label: "Good",
      className: "bg-[#BEA06A]",
    };
  }

  return {
    score,
    checks,
    label: "Strong",
    className: "bg-[var(--color-primary)]",
  };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const width = password.length === 0 ? 0 : (strength.score / 5) * 100;

  return (
    <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--color-ink-muted)]">
          Password strength
        </p>
        <p className="text-xs font-semibold text-[var(--color-ink)]">
          {strength.label}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={`h-full rounded-full transition-all duration-200 ${strength.className}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {strength.checks.map((check) => (
          <span
            key={check.label}
            className={`
              text-[11px] font-medium
              ${check.passed ? "text-[var(--color-primary)]" : "text-[var(--color-ink-faint)]"}
            `}
          >
            {check.passed ? "OK " : ""}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
