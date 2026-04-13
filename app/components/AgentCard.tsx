"use client";

interface AgentCardProps {
  name: string;
  owner: string;
  active: boolean;
  totalPayments: number;
}

export function AgentCard({
  name,
  owner,
  active,
  totalPayments,
}: AgentCardProps) {
  return (
    <div className="card transition-all hover:border-midnight-600">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{name}</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active
              ? "bg-shadow-900/40 text-shadow-400"
              : "bg-slate-800/40 text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? "bg-shadow-400" : "bg-slate-400"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Owner</span>
          <span className="font-mono text-xs text-slate-400">
            {owner.slice(0, 4)}...{owner.slice(-4)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Payments</span>
          <span className="font-medium text-white">{totalPayments}</span>
        </div>
      </div>
    </div>
  );
}
