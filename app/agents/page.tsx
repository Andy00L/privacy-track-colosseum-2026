"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AgentCard } from "../components/AgentCard";

interface AgentEntry {
  name: string;
  owner: string;
  active: boolean;
  totalPayments: number;
}

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID ||
    "85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK"
);

export default function AgentsPage() {
  const { publicKey } = useWallet();
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");

  const handleRegister = useCallback(async () => {
    if (!publicKey) {
      setError("Connect your wallet first");
      return;
    }

    if (!agentName.trim()) {
      setError("Agent name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("agent"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const newAgent: AgentEntry = {
        name: agentName.trim(),
        owner: publicKey.toBase58(),
        active: true,
        totalPayments: 0,
      };

      setAgents((prev) => [...prev, newAgent]);
      setAgentName("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register agent");
    } finally {
      setLoading(false);
    }
  }, [publicKey, agentName]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="section-header mb-0">
          <h1>Agents</h1>
          <p>Deploy and manage AI agents on the ShadowPay network</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary" : "btn-primary"}
          aria-expanded={showForm}
          aria-controls="deploy-form"
        >
          {showForm ? "Cancel" : "Deploy Agent"}
        </button>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div id="deploy-form" className="card mb-8">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Deploy a New Agent
          </h2>
          <div>
            <label htmlFor="agentName" className="mb-1.5 block text-sm font-medium text-slate-300">
              Agent Name <span className="text-red-400" aria-label="required">*</span>
            </label>
            <input
              id="agentName"
              type="text"
              className="input-field max-w-md"
              placeholder="my-trading-agent"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              maxLength={64}
              required
              aria-required="true"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Choose a unique identifier for your agent. Letters, numbers, and hyphens only.
            </p>
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Deploying...
              </span>
            ) : (
              "Deploy on Solana"
            )}
          </button>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="12" r="1.5" fill="currentColor" />
              <circle cx="14" cy="12" r="1.5" fill="currentColor" />
              <path d="M9 16C9.5 17 10.5 17.5 12 17.5C13.5 17.5 14.5 17 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              No agents deployed yet
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-400">
              Connect your wallet and deploy your first AI agent. Agents can
              autonomously discover and pay for API services.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary mt-2"
          >
            Deploy your first agent
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </div>
      )}
    </div>
  );
}
