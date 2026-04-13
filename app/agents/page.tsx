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
    "Eue6v8bKt86HRKH5tSX2caKQyoGhpRWFVNVA72JHcnZ3"
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agents</h1>
          <p className="mt-1 text-slate-400">
            Deploy and manage AI agents on the ShadowPay network
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Deploy Agent"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Deploy a New Agent
          </h2>
          <div>
            <label htmlFor="agentName" className="mb-1 block text-sm text-slate-400">
              Agent Name
            </label>
            <input
              id="agentName"
              type="text"
              className="input-field max-w-md"
              placeholder="my-trading-agent"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              maxLength={64}
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary mt-4"
          >
            {loading ? "Deploying..." : "Deploy on Solana"}
          </button>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-midnight-800">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-500"
            >
              <path
                d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 21H5C3.89543 21 3 20.1046 3 19V15M21 15V19C21 20.1046 20.1046 21 19 21H15M15 3H19C20.1046 3 21 3.89543 21 5V9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              No agents deployed yet
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Connect your wallet and deploy your first AI agent on ShadowPay.
            </p>
          </div>
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
