"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ServiceCard } from "../components/ServiceCard";

interface ServiceForm {
  serviceId: string;
  endpoint: string;
  price: string;
  description: string;
}

interface ServiceEntry {
  serviceId: string;
  endpoint: string;
  price: number;
  description: string;
  owner: string;
  active: boolean;
}

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID ||
    "85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK"
);

export default function ServicesPage() {
  const { publicKey } = useWallet();
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    serviceId: "",
    endpoint: "",
    price: "",
    description: "",
  });

  const handleRegister = useCallback(async () => {
    if (!publicKey) {
      setError("Connect your wallet first");
      return;
    }

    if (!form.serviceId || !form.endpoint || !form.price || !form.description) {
      setError("All fields are required");
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Derive PDA for the service account
      const [servicePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("service"),
          publicKey.toBuffer(),
          Buffer.from(form.serviceId),
        ],
        PROGRAM_ID
      );

      // For now, add to local state (on-chain TX will be wired when program is deployed)
      const newService: ServiceEntry = {
        serviceId: form.serviceId,
        endpoint: form.endpoint,
        price: Math.round(priceNum * 1_000_000), // Convert to USDC base units
        description: form.description,
        owner: publicKey.toBase58(),
        active: true,
      };

      setServices((prev) => [...prev, newService]);
      setForm({ serviceId: "", endpoint: "", price: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register service");
    } finally {
      setLoading(false);
    }
  }, [publicKey, form]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="section-header mb-0">
          <h1>Services</h1>
          <p>Browse and register API services on the ShadowPay network</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary" : "btn-primary"}
          aria-expanded={showForm}
          aria-controls="register-form"
        >
          {showForm ? "Cancel" : "Register Service"}
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
        <div id="register-form" className="card mb-8">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Register a New Service
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="serviceId" className="mb-1.5 block text-sm font-medium text-slate-300">
                Service ID <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input
                id="serviceId"
                type="text"
                className="input-field"
                placeholder="weather-api"
                value={form.serviceId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serviceId: e.target.value }))
                }
                maxLength={64}
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="endpoint" className="mb-1.5 block text-sm font-medium text-slate-300">
                Endpoint URL <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input
                id="endpoint"
                type="url"
                className="input-field"
                placeholder="https://api.example.com/weather"
                value={form.endpoint}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endpoint: e.target.value }))
                }
                maxLength={256}
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-300">
                Price per request (USDC) <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input
                id="price"
                type="number"
                className="input-field"
                placeholder="0.0001"
                step="0.0001"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
                Description <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input
                id="description"
                type="text"
                className="input-field"
                placeholder="Real-time weather data for any location"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                maxLength={256}
                required
                aria-required="true"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                    <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register on Solana"
              )}
            </button>
            <p className="text-xs text-slate-500">All fields are required</p>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10L10 13L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="13" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              No services registered yet
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-400">
              Connect your wallet and register the first API service on ShadowPay.
              Other agents will be able to discover and pay for it.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary mt-2"
          >
            Register your first service
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.serviceId}
              {...service}
              onPay={() => {
                // x402 payment flow will be wired here
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
