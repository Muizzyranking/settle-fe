"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthSwitchLink } from "@/components/auth/auth-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { EyeIcon, EyeSlashIcon } from "@/components/icons";
import { Field, PasswordStrengthMeter } from "./components";

const registerSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(2, "Enter your business name.")
      .max(120, "Business name is too long."),
    email: z.email("Enter a valid email address."),
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

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
  const confirmPassword = watch("confirm_password") ?? "";
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const onSubmit = async (values: RegisterFormValues) => {
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      body: JSON.stringify(values),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail = data?.detail ?? data?.error;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Could not create that account. Try again.",
      );
      return;
    }

    const params = new URLSearchParams({ email: values.email });
    router.push(`/auth/check-email?${params.toString()}`);
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
          id="register-business-name"
          label="Business name"
          error={errors.business_name?.message}
        >
          <input
            id="register-business-name"
            className="input"
            placeholder="Sunshine Estates"
            autoComplete="organization"
            {...register("business_name")}
          />
        </Field>

        <Field
          id="register-email"
          label="Email address"
          error={errors.email?.message}
        >
          <input
            id="register-email"
            className="input"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="register-first-name"
            label="First name"
            error={errors.first_name?.message}
          >
            <input
              id="register-first-name"
              className="input"
              placeholder="Chidi"
              autoComplete="given-name"
              {...register("first_name")}
            />
          </Field>
          <Field
            id="register-last-name"
            label="Last name"
            error={errors.last_name?.message}
          >
            <input
              id="register-last-name"
              className="input"
              placeholder="Okeke"
              autoComplete="family-name"
              {...register("last_name")}
            />
          </Field>
        </div>

        <Field
          id="register-phone-number"
          label="Phone number"
          error={errors.phone_number?.message}
        >
          <input
            id="register-phone-number"
            className="input"
            type="tel"
            placeholder="08012345678"
            autoComplete="tel"
            {...register("phone_number")}
          />
        </Field>

        <Field
          id="register-password"
          label="Password"
          error={errors.password?.message}
        >
          <div className="relative">
            <input
              id="register-password"
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          <PasswordStrengthMeter password={password} />
        </Field>

        <Field
          id="register-confirm-password"
          label="Confirm password"
          error={errors.confirm_password?.message}
        >
          <div className="relative">
            <input
              id="register-confirm-password"
              className="input pr-10"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {confirmPassword.length > 0 && (
            <p
              className={`mt-2 text-xs font-medium ${passwordsMatch ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
            >
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
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

      <AuthSwitchLink
        prompt="Already have an account?"
        href="/auth/login"
        label="Log in"
      />
    </>
  );
}
