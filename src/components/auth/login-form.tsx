"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthSwitchLink } from "@/components/auth/auth-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { friendlyError } from "@/lib/settle/errors";
import { EyeIcon, EyeSlashIcon } from "@/components/icons";
import { Field } from "./components";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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

  const onSubmit = async (values: LoginFormValues) => {
    setMessage(null);

    const response = await fetch("/api/auth/login", {
      body: JSON.stringify(values),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail = data?.detail ?? data?.error;

      setMessage(
        response.status === 403
          ? "Verify your email before logging in. Use the link sent to your inbox."
          : friendlyError(detail),
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const startGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <>
      <GoogleAuthButton onClick={startGoogleAuth} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs font-medium text-[var(--color-ink-faint)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          id="login-email"
          label="Email address"
          error={errors.email?.message}
        >
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <Field
          id="login-password"
          label="Password"
          error={errors.password?.message}
        >
          <div className="relative">
            <input
              id="login-password"
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
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

      <AuthSwitchLink
        prompt="New to Settle?"
        href="/auth/register"
        label="Create an account"
      />
    </>
  );
}
