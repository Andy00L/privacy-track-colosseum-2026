"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface DashboardStats {
  solBalance: number;
  servicesRegistered: number;
  agentsDeployed: number;
  totalPayments: number;
  privateBalance: string;
}

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton mt-2 h-7 w-20 rounded" />
      <div className="skeleton mt-1 h-3 w-16 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<DashboardStats>({
    solBalance: 0,
    servicesRegistered: 0,
    agentsDeployed: 0,
    totalPayments: 0,
    privateBalance: "Requires PER connection",
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      setStats({
        solBalance: balance / LAMPORTS_PER_SOL,
        servicesRegistered: 0,
        agentsDeployed: 0,
        totalPayments: 0,
        privateBalance: "Requires PER connection",
      });
    } catch {
      // Silently handle - stats will show defaults
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-midnight-700/40 bg-midnight-800/60">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-slate-500"
            aria-hidden="true"
          >
            <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 6V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Connect your wallet
          </h2>
          <p className="mt-2 max-w-sm text-slate-400">
            Connect a Solana wallet to view your dashboard, manage services,
            and monitor agent activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h1>Dashboard</h1>
        <p>Overview of your ShadowPay activity</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="stat-card">
              <p className="stat-label">SOL Balance</p>
              <p className="stat-value">
                {stats.solBalance.toFixed(4)}
              </p>
              <p className="stat-meta">Devnet</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Private USDC Balance</p>
              <p className="stat-value text-shadow-400">
                {stats.privateBalance}
              </p>
              <p className="stat-meta">Via MagicBlock PER</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Services Registered</p>
              <p className="stat-value">
                {stats.servicesRegistered}
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Agents Deployed</p>
              <p className="stat-value">
                {stats.agentsDeployed}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Wallet Info */}
      <div className="card mb-8">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Wallet Details
        </h2>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-400">Address</span>
            <code className="break-all rounded-lg bg-midnight-800/80 px-3 py-1.5 text-xs text-shadow-300 font-mono">
              {publicKey.toBase58()}
            </code>
          </div>
          <div className="glow-line" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Network</span>
            <span className="badge badge-active">
              <span className="h-1.5 w-1.5 rounded-full bg-shadow-400" aria-hidden="true" />
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight-800/60" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V10L13.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-500" />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" className="text-slate-600" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">
              No transactions yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Register a service or deploy an agent to see activity here.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/services" className="btn-secondary text-xs">
              Browse Services
            </Link>
            <Link href="/agents" className="btn-ghost text-xs">
              Deploy Agent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
