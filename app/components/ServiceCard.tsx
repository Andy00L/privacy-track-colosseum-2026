"use client";

interface ServiceCardProps {
  serviceId: string;
  endpoint: string;
  price: number;
  description: string;
  owner: string;
  active: boolean;
  onPay?: () => void;
}

export function ServiceCard({
  serviceId,
  endpoint,
  price,
  description,
  owner,
  active,
  onPay,
}: ServiceCardProps) {
  return (
    <div className={`card transition-all ${active ? "hover:border-shadow-700/50" : "opacity-60"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{serviceId}</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active
              ? "bg-shadow-900/40 text-shadow-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? "bg-shadow-400" : "bg-red-400"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-400 line-clamp-2">
        {description}
      </p>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Endpoint</span>
          <code className="rounded bg-midnight-800 px-2 py-0.5 text-xs text-shadow-300 font-mono">
            {endpoint.length > 30
              ? endpoint.slice(0, 30) + "..."
              : endpoint}
          </code>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Price</span>
          <span className="font-medium text-white">
            {(price / 1_000_000).toFixed(4)} USDC
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Owner</span>
          <span className="font-mono text-xs text-slate-400">
            {owner.slice(0, 4)}...{owner.slice(-4)}
          </span>
        </div>
      </div>

      {active && onPay && (
        <button onClick={onPay} className="btn-primary w-full text-sm">
          Pay &amp; Access
        </button>
      )}
    </div>
  );
}
