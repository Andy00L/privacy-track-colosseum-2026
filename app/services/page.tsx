"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
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
    "Eue6v8bKt86HRKH5tSX2caKQyoGhpRWFVNVA72JHcnZ3"
);

export default function ServicesPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
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
    if (!publicKey || !sendTransaction) {
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
  }, [publicKey, sendTransaction, form]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="mt-1 text-slate-400">
            Browse and register API services on the ShadowPay network
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Register Service"}
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
            Register a New Service
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="serviceId" className="mb-1 block text-sm text-slate-400">
                Service ID
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
              />
            </div>
            <div>
              <label htmlFor="endpoint" className="mb-1 block text-sm text-slate-400">
                Endpoint URL
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
              />
            </div>
            <div>
              <label htmlFor="price" className="mb-1 block text-sm text-slate-400">
                Price per request (USDC)
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
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm text-slate-400">
                Description
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
              />
            </div>
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary mt-4"
          >
            {loading ? "Registering..." : "Register on Solana"}
          </button>
        </div>
      )}

      {services.length === 0 ? (
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
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 8V12M12 16H12.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              No services registered yet
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Connect your wallet and register the first API service on ShadowPay.
            </p>
          </div>
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
