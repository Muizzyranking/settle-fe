"use client";

import { useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleVariant = "icon" | "switch";

const STORAGE_KEY = "settle-theme";

function readTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") {
      return attr;
    }
  }

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5V1M10 19v-1.5M4.7 4.7L3.65 3.65M16.35 16.35L15.3 15.3M2.5 10H1M19 10h-1.5M4.7 15.3l-1.05 1.05M16.35 3.65 15.3 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.25 12.55A6.6 6.6 0 0 1 7.45 3.75 6.7 6.7 0 1 0 16.25 12.55Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({
  variant = "icon",
  className = "",
}: {
  variant?: ThemeToggleVariant;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  const applyTheme = (next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={theme === "dark"}
        suppressHydrationWarning
        className={`
          flex w-full items-center justify-between gap-4 rounded-[var(--radius-sm)]
          border border-[var(--color-border)] bg-[var(--color-surface)]
          px-4 py-4 text-left transition-colors duration-200
          hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]
          ${className}
        `}
      >
        <span className="text-base font-medium text-[var(--color-ink)]">Dark mode</span>
        <span
          className={`
            relative h-6 w-11 rounded-full border border-[var(--color-border)]
            transition-colors duration-200
            ${theme === "dark" ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-raised)]"}
          `}
        >
          <span
            className={`
              absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full
              bg-[var(--color-bg)] shadow-[var(--shadow-btn)]
              transition-transform duration-200
              ${theme === "dark" ? "translate-x-[1.35rem]" : "translate-x-1"}
            `}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
      suppressHydrationWarning
      className={`
        relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)]
        border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]
        transition-colors duration-200 hover:border-[var(--color-border-strong)]
        hover:bg-[var(--color-surface-raised)]
        ${className}
      `}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
