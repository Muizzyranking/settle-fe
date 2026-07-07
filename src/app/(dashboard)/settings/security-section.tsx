"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SecuritySection() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function logoutAllDevices() {
    setLoggingOut(true);
    setMessage(null);

    const response = await fetch("/api/settle/auth/logout-all", {
      method: "POST",
    });

    if (response.ok) {
      setMessage("Logged out of all devices.");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not log out all devices.");
    }

    setLoggingOut(false);
    setShowConfirm(false);
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-heading)]">
            Logout all devices
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            End all active sessions including this one.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-error)] px-4 text-sm font-medium text-[var(--color-error)]"
          onClick={() => setShowConfirm(true)}
        >
          Logout all
        </button>
      </div>

      {message ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-float)]">
            <h3 className="text-lg font-semibold text-[var(--color-heading)]">
              Logout all devices?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              This will immediately end all your active sessions including this one.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)]"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loggingOut}
                className="btn-primary justify-center text-sm bg-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={logoutAllDevices}
              >
                {loggingOut ? "Logging out..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
