"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleVariant = "icon" | "switch";

const STORAGE_KEY = "settle-theme";
const THEME_CHANGE_EVENT = "settle-theme-change";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function readStoredTheme(): Theme | null {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isTheme(stored)) {
        return stored;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function readPreferredTheme(): Theme {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function readSavedTheme(): Theme {
  return readStoredTheme() ?? readPreferredTheme();
}

function readAppliedTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (isTheme(attr)) {
      return attr;
    }
  }

  return readSavedTheme();
}

function setDocumentTheme(next: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
  }
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
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const syncTheme = () => {
      const next = readSavedTheme();
      setDocumentTheme(next);
      setTheme(next);
    };

    const syncAppliedTheme = () => {
      setTheme(readAppliedTheme());
    };

    const syncSystemTheme = () => {
      if (readStoredTheme() === null) {
        syncTheme();
      }
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_CHANGE_EVENT, syncAppliedTheme);

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    media?.addEventListener("change", syncSystemTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_CHANGE_EVENT, syncAppliedTheme);
      media?.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  const applyTheme = (next: Theme) => {
    setDocumentTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The DOM theme still changes even if browser storage is unavailable.
    }
    setTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const toggleTheme = () => {
    const current = readAppliedTheme();
    applyTheme(current === "dark" ? "light" : "dark");
  };

  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
        suppressHydrationWarning
        className={`
          flex w-full items-center justify-between gap-4 rounded-[var(--radius-sm)]
          border border-[var(--color-border)] bg-[var(--color-surface)]
          px-4 py-4 text-left transition-colors duration-200
          hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]
          cursor-pointer
          ${className}
        `}
      >
        <span className="text-base font-medium text-[var(--color-ink)]">Dark mode</span>
        <span
          className={`
            theme-switch-track
            relative h-6 w-11 rounded-full border border-[var(--color-border)]
            transition-colors duration-200
          `}
        >
          <span
            className={`
              theme-switch-thumb absolute top-1/2 h-4 w-4 rounded-full
              bg-[var(--color-bg)] shadow-[var(--shadow-btn)]
              transition-transform duration-200
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
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "dark"}
      suppressHydrationWarning
      className={`
        relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)]
        border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]
        transition-colors duration-200 hover:border-[var(--color-border-strong)]
        hover:bg-[var(--color-surface-raised)]
        cursor-pointer
        ${className}
      `}
    >
      <span className="theme-toggle-icon-current-light">
        <SunIcon />
      </span>
      <span className="theme-toggle-icon-current-dark">
        <MoonIcon />
      </span>
    </button>
  );
}
