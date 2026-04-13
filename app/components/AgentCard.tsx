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
    <article
      className="card group transition-all duration-200 hover:border-midnight-600/60"
      aria-label={`Agent: ${name}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
            active
              ? "bg-shadow-900/30 text-shadow-400"
              : "bg-slate-800/30 text-slate-500"
          }`} aria-hidden="true">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-base font-semibold text-white">{name}</h3>
        </div>
        <span
          className={`badge ${active ? "badge-active" : "badge-neutral"}`}
          role="status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? "bg-shadow-400" : "bg-slate-400"
            }`}
            aria-hidden="true"
          />
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Owner</span>
          <span className="font-mono text-xs text-slate-400" title={owner}>
            {owner.slice(0, 4)}...{owner.slice(-4)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Payments</span>
          <span className="font-semibold tabular-nums text-white">{totalPayments}</span>
        </div>
      </div>
    </article>
  );
}
