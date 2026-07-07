"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BusinessType, TenantProfile } from "@/lib/settle/types";

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "landlord", label: "Landlord" },
  { value: "school", label: "School" },
  { value: "cooperative", label: "Cooperative" },
  { value: "freelancer", label: "Freelancer" },
  { value: "event_organizer", label: "Event organizer" },
  { value: "other", label: "Other" },
];

export function ProfileForm({
  tenant,
}: {
  tenant: TenantProfile;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const data: Record<string, string> = {};

    form.forEach((value, key) => {
      if (typeof value === "string" && value.trim()) {
        data[key] = value.trim();
      }
    });

    const response = await fetch("/api/settle/auth/profile", {
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      setMessage("Profile saved.");
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not save profile.");
    }

    setSaving(false);
  }

  return (
    <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Business name
        </span>
        <input
          className="input"
          name="business_name"
          defaultValue={tenant.business_name}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Business type
        </span>
        <select className="input" name="business_type" defaultValue={tenant.business_type}>
          {businessTypes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          First name
        </span>
        <input
          className="input"
          name="first_name"
          defaultValue={tenant.first_name ?? ""}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Last name
        </span>
        <input
          className="input"
          name="last_name"
          defaultValue={tenant.last_name ?? ""}
        />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Phone number
        </span>
        <input
          className="input"
          name="phone_number"
          defaultValue={tenant.phone_number ?? ""}
        />
      </label>

      {message ? (
        <p className="md:col-span-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}

      <div className="flex justify-end border-t border-[var(--color-border)] pt-5 md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
