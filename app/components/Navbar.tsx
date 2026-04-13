"use client";

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

  return (
    <nav className="sticky top-0 z-50 border-b border-midnight-800/50 bg-midnight-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shadow-600">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-white"
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
                  opacity="0.6"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">
              ShadowPay
            </span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-midnight-800/50 text-shadow-400"
                    : "text-slate-400 hover:bg-midnight-800/30 hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <WalletMultiButton className="!bg-shadow-600 !rounded-lg !h-10 !text-sm hover:!bg-shadow-500 !transition-all" />
      </div>
    </nav>
  );
}
