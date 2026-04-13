"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/agents", label: "Agents" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [mobileOpen]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-midnight-800/40 bg-midnight-950/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="ShadowPay home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shadow-600 shadow-[0_0_12px_rgba(20,190,106,0.2)] transition-shadow group-hover:shadow-[0_0_16px_rgba(20,190,106,0.3)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-white"
                aria-hidden="true"
              >
                <path
                  d="M8 1L2 4.5V11.5L8 15L14 11.5V4.5L8 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5L5 6.75V10.25L8 12L11 10.25V6.75L8 5Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Shadow<span className="text-shadow-400">Pay</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-0.5 sm:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-shadow-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-shadow-500"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet button */}
          <WalletMultiButton className="!bg-shadow-600 !rounded-lg !h-10 !text-sm !font-semibold hover:!bg-shadow-500 !transition-all !shadow-none hover:!shadow-[0_0_16px_rgba(20,190,106,0.15)]" />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-midnight-800/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shadow-400 sm:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5H17M3 10H17M3 15H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-midnight-800/40 bg-midnight-950/95 backdrop-blur-xl sm:hidden"
          role="menu"
        >
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-shadow-900/20 text-shadow-400"
                      : "text-slate-400 hover:bg-midnight-800/40 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <span
                      className="mr-2 h-1.5 w-1.5 rounded-full bg-shadow-400"
                      aria-hidden="true"
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
