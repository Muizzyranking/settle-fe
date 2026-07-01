"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Developers", href: "#developers" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Switch nav background once hero scrolls out of view */
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navBg = scrolled
    ? "bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] border-b border-[var(--color-border)] shadow-[0_1px_12px_rgba(14,59,46,0.06)] backdrop-blur-md"
    : "bg-transparent border-b border-transparent";

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-[var(--z-nav)]
          transition-all duration-300 ease-out
          ${navBg}
        `}
        aria-label="Main navigation"
      >
        <div className="container-settle flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" aria-label="Settle home">
            <Logo variant="full" size={28} scheme="auto" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-[var(--text-label)] font-medium text-[var(--color-ink)] opacity-70
                             hover:opacity-100 transition-opacity duration-200 no-underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[var(--text-label)] font-medium text-[var(--color-ink)] opacity-70
                         hover:opacity-100 transition-opacity duration-200 no-underline min-h-[48px]
                         flex items-center"
            >
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5
                       w-12 h-12 rounded-[var(--radius-sm)] -mr-2
                       focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <motion.span
              animate={drawerOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-0.5 bg-[var(--color-ink)] rounded-full origin-center"
            />
            <motion.span
              animate={drawerOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-5 h-0.5 bg-[var(--color-ink)] rounded-full"
            />
            <motion.span
              animate={drawerOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-0.5 bg-[var(--color-ink)] rounded-full origin-center"
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-ink)] opacity-20 md:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="
                fixed top-0 right-0 bottom-0 z-[var(--z-modal)]
                w-[min(320px,85vw)] bg-[var(--color-bg)]
                shadow-[var(--shadow-float)] md:hidden
                flex flex-col
              "
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)]">
                <Logo variant="full" size={24} scheme="auto" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)]
                             text-[var(--color-ink)] opacity-60 hover:opacity-100"
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 p-4 flex-1">
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.a
                    key={href}
                    href={href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    onClick={() => setDrawerOpen(false)}
                    className="
                      flex items-center px-4 py-4 rounded-[var(--radius-sm)]
                      text-[var(--color-ink)] font-medium text-base no-underline
                      hover:bg-[var(--color-bg-subtle)] transition-colors duration-150
                    "
                  >
                    {label}
                  </motion.a>
                ))}

                {/* Divider */}
                <div className="my-2 border-t border-[var(--color-border)]" />

                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="
                    flex items-center px-4 py-4 rounded-[var(--radius-sm)]
                    text-[var(--color-ink)] font-medium text-base no-underline
                    hover:bg-[var(--color-bg-subtle)] transition-colors duration-150
                  "
                >
                  Log in
                </Link>

                <ThemeToggle variant="switch" className="mt-1 border-0 bg-transparent hover:bg-[var(--color-bg-subtle)]" />
              </nav>

              {/* CTA at bottom of drawer */}
              <div className="p-6 border-t border-[var(--color-border)]">
                <Link
                  href="/register"
                  className="btn-primary w-full justify-center text-base"
                  onClick={() => setDrawerOpen(false)}
                >
                  Get started free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
