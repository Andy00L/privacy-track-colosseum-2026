"use client";

interface ServiceCardProps {
  serviceId: string;
  endpoint: string;
  price: number;
  description: string;
  owner: string;
  active: boolean;
  onPay?: () => void;
  loading?: boolean;
}

export function ServiceCard({
  serviceId,
  endpoint,
  price,
  description,
  owner,
  active,
  onPay,
  loading = false,
}: ServiceCardProps) {
  return (
    <article
      className={`card group transition-all duration-200 ${
        active
          ? "hover:border-shadow-700/40 hover:shadow-[0_0_24px_rgba(20,190,106,0.04)]"
          : "opacity-50"
      }`}
      aria-label={`Service: ${serviceId}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{serviceId}</h3>
        <span
          className={`badge ${active ? "badge-active" : "badge-inactive"}`}
          role="status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? "bg-shadow-400" : "bg-red-400"
            }`}
            aria-hidden="true"
          />
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-slate-400 line-clamp-2">
        {description}
      </p>

      <div className="mb-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Endpoint</span>
          <code className="max-w-[200px] truncate rounded bg-midnight-800/80 px-2 py-0.5 text-xs text-shadow-300 font-mono">
            {endpoint}
          </code>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Price</span>
          <span className="font-semibold tabular-nums text-white">
            {(price / 1_000_000).toFixed(4)}{" "}
            <span className="text-xs font-normal text-slate-400">USDC</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Owner</span>
          <span className="font-mono text-xs text-slate-400" title={owner}>
            {owner.slice(0, 4)}...{owner.slice(-4)}
          </span>
        </div>
      </div>

      {active && onPay && (
        <button
          onClick={onPay}
          disabled={loading}
          className="btn-primary w-full text-sm"
          aria-label={`Pay and access ${serviceId}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Processing...
            </span>
          ) : (
            "Pay & Access"
          )}
        </button>
      )}
    </article>
  );
}
