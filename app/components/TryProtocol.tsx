"use client";

import { useState, useCallback } from "react";

const DEMO_SERVICES = [
  { id: "weather", name: "Weather API", price: "0.0001" },
  { id: "ip-info", name: "IP Info", price: "0.00005" },
  { id: "timestamp", name: "Timestamp", price: "0.000025" },
];

export function TryProtocol() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const tryService = useCallback(async (serviceId: string) => {
    setSelectedService(serviceId);
    setResponse(null);
    setStatusCode(null);
    setLoading(true);
    setStep(1);

    try {
      await new Promise((r) => setTimeout(r, 300));
      setStep(2);

      const res = await fetch(`/api/services/${serviceId}`);
      setStatusCode(res.status);
      setResponse((await res.json()) as Record<string, unknown>);
      setStep(3);
    } catch (err) {
      setResponse({ error: err instanceof Error ? err.message : "Request failed" });
      setStatusCode(0);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        {DEMO_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => tryService(service.id)}
            disabled={loading}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
              selectedService === service.id
                ? "border-shadow-600 bg-shadow-900/30 text-shadow-300"
                : "border-midnight-700 bg-midnight-800/50 text-slate-400 hover:border-shadow-700/40 hover:text-white"
            }`}
            aria-label={`Try ${service.name} - ${service.price} USDC`}
          >
            {service.name}
            <span className="ml-2 text-xs text-slate-500">{service.price} USDC</span>
          </button>
        ))}
      </div>

      {selectedService && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-xs sm:gap-2">
            <span className={`transition-colors ${step >= 1 ? "text-shadow-400" : "text-slate-600"}`}>
              1. GET /api/services/{selectedService}
            </span>
            <span className="text-slate-700" aria-hidden="true">&rarr;</span>
            <span className={`transition-colors ${step >= 2 ? "text-shadow-400" : "text-slate-600"}`}>
              2. Gateway processes
            </span>
            <span className="text-slate-700" aria-hidden="true">&rarr;</span>
            <span className={`transition-colors ${step >= 3 ? "text-shadow-400" : "text-slate-600"}`}>
              3. {statusCode === 402 ? "402 Payment Required" : statusCode ? `${statusCode} Response` : "..."}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-midnight-700 bg-midnight-900">
            <div className="flex items-center gap-2 border-b border-midnight-700 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" aria-hidden="true" />
              <span className="ml-2 font-mono text-xs text-slate-500">
                x402 Protocol Response
              </span>
            </div>
            <div className="p-4">
              {loading && !response ? (
                <div className="flex items-center gap-2 font-mono text-sm text-slate-400">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                    <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Querying x402 gateway...
                </div>
              ) : response ? (
                <div>
                  {statusCode === 402 && (
                    <p className="mb-2 font-mono text-xs text-shadow-400">
                      HTTP/1.1 402 Payment Required
                    </p>
                  )}
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-slate-300">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                  {statusCode === 402 && (
                    <p className="mt-3 border-t border-midnight-700 pt-3 text-xs text-slate-500">
                      An agent would now build a USDC transfer to the recipient, sign it, and retry with an X-Payment header to access the service.
                    </p>
                  )}
                  {statusCode === 503 && (
                    <p className="mt-3 text-xs text-slate-500">
                      Configure NEXT_PUBLIC_TREASURY_WALLET in .env to enable payment terms.
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-mono text-sm text-slate-600">
                  Select a service above to query the gateway.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
