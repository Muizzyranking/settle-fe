"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthSwitchLink } from "@/components/auth/auth-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

const registerSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(2, "Enter your business name.")
      .max(120, "Business name is too long."),
    email: z.string().trim().email("Enter a valid email address."),
    first_name: z.string().trim().max(80, "First name is too long.").optional(),
    last_name: z.string().trim().max(80, "Last name is too long.").optional(),
    phone_number: z
      .string()
      .trim()
      .regex(/^(|[+]?\d[\d\s-]{7,18})$/, "Enter a valid phone number.")
      .optional(),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter.")
      .regex(/\d/, "Add at least one number.")
      .regex(/[^A-Za-z0-9]/, "Add at least one symbol."),
    confirm_password: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type PasswordStrength = {
  score: number;
  label: string;
  className: string;
  checks: Array<{ label: string; passed: boolean }>;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">{label}</span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-medium text-[var(--color-error)]">
          {error}
        </span>
      ) : null}
    </label>
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

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const width = password.length === 0 ? 0 : (strength.score / 5) * 100;

  return (
    <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--color-ink-muted)]">Password strength</p>
        <p className="text-xs font-semibold text-[var(--color-ink)]">{strength.label}</p>
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

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      business_name: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      confirm_password: "",
    },
  });
  const password = watch("password");

  const onSubmit = async (values: RegisterFormValues) => {
    setMessage(null);

    // Visualization-only for now. This mirrors the payload shape for
    // POST /v1/auth/register and keeps tokens out of browser storage.
    const params = new URLSearchParams({ email: values.email });
    router.push(`/auth/check-email?${params.toString()}`);
  };

  const startGoogleAuth = () => {
    setMessage("Google auth will redirect through the backend when auth is wired.");
  };

  return (
    <>
      <GoogleAuthButton onClick={startGoogleAuth} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs font-medium text-[var(--color-ink-faint)]">or</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Business name" error={errors.business_name?.message}>
          <input
            className="input"
            placeholder="Sunshine Estates"
            autoComplete="organization"
            {...register("business_name")}
          />
        </Field>

        <Field label="Email address" error={errors.email?.message}>
          <input
            className="input"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.first_name?.message}>
            <input
              className="input"
              placeholder="Chidi"
              autoComplete="given-name"
              {...register("first_name")}
            />
          </Field>
          <Field label="Last name" error={errors.last_name?.message}>
            <input
              className="input"
              placeholder="Okeke"
              autoComplete="family-name"
              {...register("last_name")}
            />
          </Field>
        </div>

        <Field label="Phone number" error={errors.phone_number?.message}>
          <input
            className="input"
            type="tel"
            placeholder="08012345678"
            autoComplete="tel"
            {...register("phone_number")}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            className="input"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            {...register("password")}
          />
          <PasswordStrengthMeter password={password} />
        </Field>

        <Field label="Confirm password" error={errors.confirm_password?.message}>
          <input
            className="input"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register("confirm_password")}
          />
        </Field>

        {message ? (
          <p className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 w-full justify-center text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <AuthSwitchLink prompt="Already have an account?" href="/auth/login" label="Log in" />
    </>
  );
}
