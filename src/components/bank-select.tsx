"use client";

import { useEffect, useRef, useState } from "react";

type Bank = {
  code: string;
  name: string;
};

export function BankSelect({
  banks,
  value,
  onChange,
  loading,
  label = "Bank",
  placeholder = "Search for a bank...",
}: {
  banks: Bank[];
  value: string;
  onChange: (code: string) => void;
  loading?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = banks.find((b) => b.code === value);

  const filtered = query.trim()
    ? banks.filter((b) =>
        b.name.toLowerCase().includes(query.toLowerCase()),
      )
    : banks;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <span className="mb-2 block text-xs font-medium text-[var(--color-ink-faint)]">
        {label}
      </span>
      <div className="relative">
        <input
          className="input cursor-pointer"
          readOnly={!open}
          placeholder={
            loading ? "Loading banks..." : selected?.name ?? placeholder
          }
          value={open ? query : selected?.name ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && filtered.length === 1) {
              onChange(filtered[0].code);
              setOpen(false);
            }
          }}
        />
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {open ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-float)]">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-ink-muted)]">
              No banks match &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((bank) => (
              <button
                key={bank.code}
                type="button"
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-subtle)] ${
                  bank.code === value
                    ? "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] font-medium text-[var(--color-primary)]"
                    : "text-[var(--color-ink)]"
                }`}
                onClick={() => {
                  onChange(bank.code);
                  setOpen(false);
                }}
              >
                {bank.name}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
