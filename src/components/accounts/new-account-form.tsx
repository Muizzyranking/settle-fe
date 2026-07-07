"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { formatNaira } from "@/lib/settle/format";
import type { CollectionSummary } from "@/lib/settle/types";

type NewAccountFormProps = {
  collections: CollectionSummary[];
  selectedCollectionId?: string;
};

function getInitialCollection(
  collections: CollectionSummary[],
  selectedCollectionId?: string,
) {
  return collections.find(
    (collection) => collection.id === selectedCollectionId,
  );
}

function FieldHint({ required = false }: { required?: boolean }) {
  return (
    <span className="ml-2 text-xs font-medium text-[var(--color-ink-faint)]">
      {required ? "Required" : "Optional"}
    </span>
  );
}

export function NewAccountForm({
  collections,
  selectedCollectionId,
}: NewAccountFormProps) {
  const router = useRouter();
  const initialCollection = getInitialCollection(
    collections,
    selectedCollectionId,
  );
  const [collectionId, setCollectionId] = useState(initialCollection?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [expectedAmount, setExpectedAmount] = useState(
    initialCollection?.expected_amount
      ? String(initialCollection.expected_amount)
      : "",
  );
  const [description, setDescription] = useState(
    initialCollection ? `${initialCollection.name} payment` : "",
  );
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === collectionId),
    [collectionId, collections],
  );

  const expected = Number(expectedAmount.replace(/[^\d.]/g, "")) || 0;

  const onCollectionChange = (value: string) => {
    const nextCollection = collections.find(
      (collection) => collection.id === value,
    );

    setCollectionId(value);

    if (nextCollection) {
      setExpectedAmount(String(nextCollection.expected_amount));
      setDescription(`${nextCollection.name} payment`);
    } else {
      setDescription("");
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsProvisioning(true);

    const response = await fetch("/api/settle/accounts", {
      body: JSON.stringify({
        collection_id: collectionId || undefined,
        customer_email: customerEmail.trim() || undefined,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        description: description.trim() || undefined,
        expected_amount: expected > 0 ? expected : undefined,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);
    const account = data?.account ?? data;

    setIsProvisioning(false);

    if (!response.ok) {
      const detail = data?.detail ?? data?.error;

      if (response.status === 401 || detail === "session_expired") {
        router.push("/auth/login?error=session_expired");
        router.refresh();
        return;
      }

      setError(
        response.status === 409
          ? "A customer with this reference already exists."
          : typeof detail === "string"
            ? detail
            : "Could not provision account. Please try again.",
      );
      return;
    }

    const accountId = account?.id ?? account?.account_id ?? account?.virtual_account_id;

    if (!accountId) {
      setError("The account was provisioned, but the backend did not return an account ID.");
      return;
    }

    router.push(`/accounts/${accountId}`);
    router.refresh();
  };

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
      onSubmit={onSubmit}
    >
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Collection
              <FieldHint />
            </span>
            <select
              className="input"
              value={collectionId}
              onChange={(event) => onCollectionChange(event.target.value)}
            >
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Customer name
              <FieldHint required />
            </span>
            <input
              className="input"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Customer email
              <FieldHint />
            </span>
            <input
              className="input"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Customer phone
              <FieldHint />
            </span>
            <input
              className="input"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Expected amount
              <FieldHint />
            </span>
            <input
              className="input"
              inputMode="decimal"
              value={expectedAmount}
              onChange={(event) => setExpectedAmount(event.target.value)}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Description
              <FieldHint />
            </span>
            <textarea
              className="input min-h-28 resize-y py-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-ink-muted)]">
            If an email is provided, the customer receives the dedicated account
            details.
          </p>
          <button
            type="submit"
            disabled={isProvisioning}
            className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProvisioning ? "Provisioning..." : "Provision account"}
          </button>
        </div>
        {error ? (
          <p className="mt-4 text-sm font-medium text-[var(--color-error)]">
            {error}
          </p>
        ) : null}
      </div>

      <aside className="grid content-start gap-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-mono text-[var(--color-ink-faint)]">
            Payment setup
          </p>
          <div className="mt-5 grid gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                Customer
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                {customerName || "Customer name"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                Collection
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                {selectedCollection?.name ?? "No collection"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                Expected
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-heading)]">
                {formatNaira(expected)}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
