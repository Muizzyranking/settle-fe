"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthSwitchLink } from "@/components/auth/auth-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    setMessage(null);
    router.push("/dashboard");
  };

  const startGoogleAuth = () => {
    setMessage("Google auth will exchange a one-time code when auth is wired.");
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
        <Field label="Email address" error={errors.email?.message}>
          <input
            className="input"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            className="input"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register("password")}
          />
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            Remember this device
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-[var(--color-primary)] no-underline hover:underline"
          >
            Forgot password?
          </Link>
        </div>

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
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <AuthSwitchLink prompt="New to Settle?" href="/auth/register" label="Create an account" />
    </>
  );
}
