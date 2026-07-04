"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { TenantProfile } from "@/lib/settle/types";

type AppShellProps = {
  tenant: Pick<TenantProfile, "business_name" | "email">;
  children: ReactNode;
};

type IconProps = {
  className?: string;
};

const iconClass = "h-5 w-5";

function OverviewIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 13.5 12 6l8 7.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollectionsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 6.5h10M7 12h10M7 17.5h6M5 3.5h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19M14 5.3a3.6 3.6 0 1 1 0 5.4M10 5.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM20 19v-1.2a3.2 3.2 0 0 0-2.4-3.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TransactionsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 8h10M7 12h10M7 16h6M5 3.5h14a1 1 0 0 1 1 1v15.2l-2.5-1.3-2.5 1.3-2.5-1.3-2.5 1.3-2.5-1.3L4 19.7V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReportsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 19V5M5 19h14M9 16v-5M13 16V8M17 16v-8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FinanceIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 8.5h16M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM8 15h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 0 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8a2 2 0 0 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8a2 2 0 0 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M18 9.8A6 6 0 0 0 6 9.8c0 7-2.2 7.2-2.2 7.2h16.4S18 16.8 18 9.8ZM9.8 20a2.4 2.4 0 0 0 4.4 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocsIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 7 4 12l4 5M16 7l4 5-4 5M13.5 5.5l-3 13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollapseIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 6h16M4 12h10M4 18h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className = iconClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navigation = [
  { label: "Home", desktopLabel: "Overview", href: "/dashboard", icon: OverviewIcon },
  { label: "Collections", desktopLabel: "Collections", href: "/collections", icon: CollectionsIcon },
  { label: "Accounts", desktopLabel: "Accounts", href: "/accounts", icon: AccountsIcon },
  { label: "Activity", desktopLabel: "Transactions", href: "/transactions", icon: TransactionsIcon },
  { label: "Reports", desktopLabel: "Reports", href: "/reports", icon: ReportsIcon },
  { label: "Money", desktopLabel: "Finance", href: "/finance", icon: FinanceIcon },
  { label: "Settings", desktopLabel: "Settings", href: "/settings", icon: SettingsIcon },
  { label: "Developers", desktopLabel: "Developer docs", href: "/developers", icon: DocsIcon },
];

function isActiveNavigationItem(href: string, activeHref: string) {
  if (href === "/dashboard") {
    return activeHref === href;
  }

  return activeHref === href || activeHref.startsWith(`${href}/`);
}

function ActionLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] no-underline transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]"
    >
      {children}
    </Link>
  );
}

function DesktopNavigationLink({
  item,
  activeHref,
  collapsed,
}: {
  item: (typeof navigation)[number];
  activeHref: string;
  collapsed: boolean;
}) {
  const isActive = isActiveNavigationItem(item.href, activeHref);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.desktopLabel : undefined}
      className={`
        flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] text-sm font-medium no-underline
        ${collapsed ? "justify-center px-2" : "px-3"}
        ${
          isActive
            ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
            : "text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-ink)]"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.desktopLabel}</span>
    </Link>
  );
}

function DrawerNavigationLink({
  item,
  activeHref,
  onNavigate,
}: {
  item: (typeof navigation)[number];
  activeHref: string;
  onNavigate: () => void;
}) {
  const isActive = isActiveNavigationItem(item.href, activeHref);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`
        flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium no-underline transition-colors
        ${
          isActive
            ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
            : "text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-ink)]"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon />
      <span className="truncate">{item.desktopLabel}</span>
    </Link>
  );
}

export function AppShell({ tenant, children }: AppShellProps) {
  const activeHref = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main
      className={`
        min-h-screen bg-[var(--color-bg)] transition-[padding-left] duration-200 ease-out
        ${collapsed ? "lg:pl-[5.5rem]" : "lg:pl-[17rem]"}
      `}
    >
      {/* Desktop sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 hidden h-screen overflow-hidden border-r border-[var(--color-border)]
          bg-[var(--color-surface-raised)] px-4 py-5 transition-[width] duration-200 ease-out lg:flex lg:flex-col
          ${collapsed ? "w-[5.5rem]" : "w-[17rem]"}
        `}
      >
        <div
          className={`
            flex items-center gap-2
            ${collapsed ? "flex-col" : "justify-between"}
          `}
        >
          <Link href="/" aria-label="Settle home" className="min-w-0">
            <Logo
              variant={collapsed ? "mark" : "full"}
              size={collapsed ? 32 : 28}
              scheme="auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-subtle)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CollapseIcon className="h-5 w-5" />
          </button>
        </div>

        {!collapsed ? (
          <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
              {tenant.business_name}
            </p>
            <p className="mt-1 truncate text-xs text-[var(--color-ink-faint)]">{tenant.email}</p>
          </div>
        ) : null}

        <nav aria-label="Dashboard sections" className="mt-6 grid gap-1">
          {navigation.map((item) => (
            <DesktopNavigationLink
              key={item.href}
              item={item}
              activeHref={activeHref}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile drawer + backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`
          fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out lg:hidden
          ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
        `}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!mobileOpen}
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[17rem] flex-col border-r border-[var(--color-border)]
          bg-[var(--color-surface-raised)] px-4 py-5 transition-transform duration-200 ease-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Settle home" onClick={() => setMobileOpen(false)}>
            <Logo variant="full" size={28} scheme="auto" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-subtle)]"
            aria-label="Close menu"
            title="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
            {tenant.business_name}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--color-ink-faint)]">{tenant.email}</p>
        </div>

        <nav aria-label="Dashboard sections" className="mt-6 grid gap-1 overflow-y-auto">
          {navigation.map((item) => (
            <DrawerNavigationLink
              key={item.href}
              item={item}
              activeHref={activeHref}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-raised)_94%,transparent)] backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-subtle)] lg:hidden"
            aria-label="Open menu"
            title="Open menu"
          >
            <CollapseIcon className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 lg:hidden">
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
              {tenant.business_name}
            </p>
            <p className="truncate text-xs text-[var(--color-ink-faint)]">{tenant.email}</p>
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{tenant.business_name}</p>
          </div>

          <div className="flex items-center gap-2">
            <ActionLink href="/notifications" label="Notifications">
              <BellIcon />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </ActionLink>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mx-auto w-full max-w-[1180px]">{children}</section>
      </div>
    </main>
  );
}
