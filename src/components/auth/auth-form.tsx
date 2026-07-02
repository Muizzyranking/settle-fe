import Link from "next/link";

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">{label}</span>
      <input
        className="input"
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

export function AuthAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-primary mt-2 w-full justify-center text-[15px]">
      {children}
    </Link>
  );
}

export function AuthSwitchLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
      {prompt}{" "}
      <Link href={href} className="font-medium text-[var(--color-primary)] no-underline hover:underline">
        {label}
      </Link>
    </p>
  );
}
