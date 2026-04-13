"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ServiceCard } from "../components/ServiceCard";
import {
  buildRegisterServiceIx,
  buildAndSignTx,
  fetchAllServices,
  type ServiceData,
} from "@/src/program/client";

interface X402Terms {
  x402Version: number;
  network: string;
  payment: {
    recipientWallet: string;
    tokenAccount: string;
    mint: string;
    amount: number;
    amountUSDC: number;
    description: string;
  };
}

interface ServiceForm {
  serviceId: string;
  endpoint: string;
  price: string;
  description: string;
}

const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export default function ServicesPage() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    serviceId: "",
    endpoint: "",
    price: "",
    description: "",
  });
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<X402Terms | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Record<string, unknown> | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch existing services from on-chain
  const loadServices = useCallback(async () => {
    setFetchingServices(true);
    try {
      const onChainServices = await fetchAllServices(connection);
      setServices(onChainServices);
    } catch {
      // Program may not be deployed yet; show empty state
    } finally {
      setFetchingServices(false);
    }
  }, [connection]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

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
    setTxSignature(null);

    try {
      const priceLamports = Math.round(priceNum * 1_000_000);

      const ix = buildRegisterServiceIx(
        publicKey,
        form.serviceId,
        form.endpoint,
        priceLamports,
        form.description,
        USDC_MINT
      );

      const tx = await buildAndSignTx(connection, publicKey, [ix]);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);
      setForm({ serviceId: "", endpoint: "", price: "", description: "" });
      setShowForm(false);

      // Refresh the services list
      await loadServices();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("custom program error") || msg.includes("not found")) {
        setError(
          "Transaction failed. The ShadowPay program may not be deployed on the current network. " +
          "Run 'anchor deploy' to deploy it first."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, form, connection, loadServices]);

  const handlePayRequest = useCallback(async (service: ServiceData) => {
    setSelectedService(service);
    setPaymentTerms(null);
    setPaymentResult(null);
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      const res = await fetch(`/api/services/${encodeURIComponent(service.serviceId)}`);
      if (res.status === 402) {
        setPaymentTerms((await res.json()) as X402Terms);
      } else if (res.status === 404) {
        setPaymentError(
          `Service "${service.serviceId}" is not in the x402 demo gateway. ` +
          "Available demo services: weather, ip-info, timestamp."
        );
      } else {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        setPaymentError((data as { error?: string }).error || `Unexpected response: ${res.status}`);
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to fetch payment terms");
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const handlePayConfirm = useCallback(async () => {
    if (!publicKey || !signTransaction || !paymentTerms || !selectedService) return;

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const { payment } = paymentTerms;
      const mint = new PublicKey(payment.mint);
      const destination = new PublicKey(payment.tokenAccount);

      const { getAssociatedTokenAddress, createTransferInstruction } = await import("@solana/spl-token");
      const sourceAta = await getAssociatedTokenAddress(mint, publicKey);
      const transferIx = createTransferInstruction(sourceAta, destination, publicKey, payment.amount);

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });
      tx.add(transferIx);

      const signedTx = await signTransaction(tx);
      const serializedTx = signedTx.serialize().toString("base64");
      const xPayment = btoa(JSON.stringify({ payload: { serializedTransaction: serializedTx } }));

      const res = await fetch(`/api/services/${encodeURIComponent(selectedService.serviceId)}`, {
        headers: { "X-Payment": xPayment },
      });

      const data = await res.json();
      if (res.ok) {
        setPaymentResult(data as Record<string, unknown>);
        setPaymentTerms(null);
      } else {
        setPaymentError((data as { error?: string }).error || "Payment verification failed");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (msg.includes("insufficient") || msg.includes("0x1") || msg.includes("could not find")) {
        setPaymentError(
          "Insufficient USDC balance. Devnet USDC is required. " +
          "Run 'npm run agent:demo' for the full payment flow with a pre-funded agent."
        );
      } else {
        setPaymentError(msg);
      }
    } finally {
      setPaymentLoading(false);
    }
  }, [publicKey, signTransaction, paymentTerms, selectedService, connection]);

  const closePaymentPanel = useCallback(() => {
    setSelectedService(null);
    setPaymentTerms(null);
    setPaymentResult(null);
    setPaymentError(null);
  }, []);

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

      {txSignature && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-shadow-800/40 bg-shadow-900/10 px-4 py-3 text-sm text-shadow-400" role="status">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            Service registered on-chain.{" "}
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-shadow-300"
            >
              View transaction
            </a>
          </span>
        </div>
      )}

      {selectedService && (
        <div className="card mb-8" role="region" aria-label="x402 Payment">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              x402 Payment: {selectedService.serviceId}
            </h2>
            <button
              onClick={closePaymentPanel}
              className="text-sm text-slate-400 hover:text-white"
              aria-label="Close payment panel"
            >
              Close
            </button>
          </div>

          {paymentLoading && !paymentTerms && !paymentResult && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Fetching payment terms via x402 protocol...
            </div>
          )}

          {paymentTerms && (
            <div>
              <div className="mb-4 rounded-lg border border-midnight-700 bg-midnight-800/50 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-shadow-400">
                  HTTP 402 Response
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Protocol</span>
                    <span className="text-white">x402 v{paymentTerms.x402Version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Network</span>
                    <span className="text-white">{paymentTerms.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-semibold text-white">
                      {paymentTerms.payment.amountUSDC} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-mono text-xs text-slate-300" title={paymentTerms.payment.recipientWallet}>
                      {paymentTerms.payment.recipientWallet.slice(0, 8)}...{paymentTerms.payment.recipientWallet.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Token</span>
                    <span className="font-mono text-xs text-slate-300" title={paymentTerms.payment.mint}>
                      {paymentTerms.payment.mint.slice(0, 8)}...{paymentTerms.payment.mint.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {publicKey && signTransaction ? (
                <button
                  onClick={handlePayConfirm}
                  disabled={paymentLoading}
                  className="btn-primary w-full"
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                        <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Processing payment...
                    </span>
                  ) : (
                    "Pay with Wallet"
                  )}
                </button>
              ) : (
                <p className="text-sm text-slate-400">
                  Connect your wallet to pay, or run{" "}
                  <code className="rounded bg-midnight-800 px-1.5 py-0.5 text-xs text-shadow-300">
                    npm run agent:demo
                  </code>{" "}
                  for the CLI agent demo.
                </p>
              )}
            </div>
          )}

          {paymentResult && (
            <div className="rounded-lg border border-shadow-800/40 bg-shadow-900/10 p-4">
              <p className="mb-2 text-sm font-medium text-shadow-400">Payment Verified</p>
              <pre className="overflow-x-auto rounded bg-midnight-900 p-3 text-xs text-slate-300">
                {JSON.stringify(paymentResult, null, 2)}
              </pre>
            </div>
          )}

          {paymentError && (
            <div className="alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{paymentError}</span>
            </div>
          )}
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
            <p className="text-xs text-slate-500">
              Sends a transaction to the ShadowPay on-chain registry
            </p>
          </div>
        </div>
      )}

      {fetchingServices ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton mt-3 h-3 w-full rounded" />
              <div className="skeleton mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
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
              serviceId={service.serviceId}
              endpoint={service.endpoint}
              price={service.price}
              description={service.description}
              owner={service.owner}
              active={service.active}
              onPay={() => handlePayRequest(service)}
              loading={paymentLoading && selectedService?.serviceId === service.serviceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
