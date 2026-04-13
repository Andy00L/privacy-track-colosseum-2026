"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface DashboardStats {
  solBalance: number;
  servicesRegistered: number;
  agentsDeployed: number;
  totalPayments: number;
  privateBalance: string;
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<DashboardStats>({
    solBalance: 0,
    servicesRegistered: 0,
    agentsDeployed: 0,
    totalPayments: 0,
    privateBalance: "Loading...",
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
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-midnight-800">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-slate-500"
          >
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M15 10L12 13L9 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Connect your wallet
        </h2>
        <p className="text-slate-400">
          Connect a Solana wallet to view your dashboard
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Overview of your ShadowPay activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">SOL Balance</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {loading ? "..." : stats.solBalance.toFixed(4)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Devnet</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Private USDC Balance</p>
          <p className="mt-1 text-2xl font-bold text-shadow-400">
            {stats.privateBalance}
          </p>
          <p className="mt-1 text-xs text-slate-500">Via MagicBlock PER</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Services Registered</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats.servicesRegistered}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Agents Deployed</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats.agentsDeployed}
          </p>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="card mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Wallet Details
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Address</span>
            <code className="rounded bg-midnight-800 px-3 py-1 text-xs text-shadow-300 font-mono">
              {publicKey.toBase58()}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Network</span>
            <span className="text-sm text-slate-200">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-slate-500">
            No transactions yet. Register a service or deploy an agent to get
            started.
          </p>
        </div>
      </div>
    </div>
  );
}
