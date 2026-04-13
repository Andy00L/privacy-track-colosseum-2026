import Link from "next/link";

function ProtocolFlowDiagram() {
  return (
    <div className="relative mx-auto max-w-3xl" aria-label="Protocol flow diagram showing Agent, Gateway, and Service communication">
      {/* Connection lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 120"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Agent to Gateway */}
        <line x1="130" y1="60" x2="240" y2="60" stroke="rgba(20,190,106,0.3)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="185" cy="60" r="2" fill="#14be6a" opacity="0.6">
          <animate attributeName="cx" values="140;230" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Gateway to Service */}
        <line x1="360" y1="60" x2="470" y2="60" stroke="rgba(20,190,106,0.3)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="415" cy="60" r="2" fill="#14be6a" opacity="0.6">
          <animate attributeName="cx" values="370;460" dur="2s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="relative grid grid-cols-3 gap-4 sm:gap-8">
        {/* Agent Node */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-shadow-700/30 bg-shadow-950/50 sm:h-16 sm:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="4" stroke="#14be6a" strokeWidth="1.5" />
              <circle cx="10" cy="12" r="1.5" fill="#14be6a" />
              <circle cx="14" cy="12" r="1.5" fill="#14be6a" />
              <path d="M9 16C9.5 17 10.5 17.5 12 17.5C13.5 17.5 14.5 17 15 16" stroke="#14be6a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Agent</p>
            <p className="mt-0.5 text-xs text-slate-500">Requests API access</p>
          </div>
        </div>

        {/* Gateway Node */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-shadow-600/40 bg-shadow-900/30 shadow-[0_0_24px_rgba(20,190,106,0.1)] sm:h-16 sm:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="#3dd888" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 8L8 10.25V14.75L12 17L16 14.75V10.25L12 8Z" fill="#14be6a" opacity="0.4" />
              <circle cx="12" cy="12" r="2" fill="#14be6a" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-shadow-400">x402 Gateway</p>
            <p className="mt-0.5 text-xs text-slate-500">Private settlement</p>
          </div>
        </div>

        {/* Service Node */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-midnight-600/40 bg-midnight-800/50 sm:h-16 sm:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="#64748b" strokeWidth="1.5" />
              <path d="M7 10L10 13L7 16" stroke="#14be6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="13" y1="16" x2="17" y2="16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">API Service</p>
            <p className="mt-0.5 text-xs text-slate-500">Returns data</p>
          </div>
        </div>
      </div>

      {/* Protocol labels */}
      <div className="mt-3 grid grid-cols-3 gap-4 sm:gap-8">
        <div />
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-shadow-500" aria-hidden="true" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-shadow-500/70">MagicBlock PER</span>
          <span className="h-1 w-1 rounded-full bg-shadow-500" aria-hidden="true" />
        </div>
        <div />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Private Settlements",
    description: "USDC transfers through MagicBlock's Private Payments API. No on-chain link between sender and receiver.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2L3 5.5V14.5L10 18L17 14.5V5.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8V12M8 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "x402 Protocol",
    description: "HTTP-native micropayments. Agents get 402 responses with payment terms and settle automatically.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4H16V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14V4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 4L8 2H12L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 8H12M8 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "TEE Execution",
    description: "Agent logic runs inside MagicBlock's Trusted Execution Environment. Intent stays confidential.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7" y="7" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="3" x2="10" y2="7" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="13" x2="10" y2="17" stroke="currentColor" strokeWidth="1" />
        <line x1="3" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1" />
        <line x1="13" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "On-Chain Registry",
    description: "Services register on Solana with Anchor smart contracts. Discoverable by any agent in the network.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="5" r="1" fill="currentColor" />
        <circle cx="6" cy="10" r="1" fill="currentColor" />
        <circle cx="6" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

const TECH_STACK = [
  { name: "Solana", role: "L1 Settlement", mono: "SPL" },
  { name: "MagicBlock", role: "Private Execution", mono: "PER" },
  { name: "Private Payments", role: "Confidential USDC", mono: "API" },
  { name: "x402 Protocol", role: "Agent Commerce", mono: "402" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="relative flex w-full flex-col items-center gap-6 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 opacity-20"
          style={{
            background: "radial-gradient(ellipse at center, rgba(20,190,106,0.15) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Pill badge */}
        <div className="animate-in inline-flex items-center gap-2 rounded-full border border-shadow-800/40 bg-shadow-950/40 px-4 py-1.5 text-sm text-shadow-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-shadow-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} aria-hidden="true" />
          Privacy-first agent payments on Solana
        </div>

        {/* Headline */}
        <h1 className="animate-in animate-in-delay-1 max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Private payments for the{" "}
          <span className="bg-gradient-to-r from-shadow-400 to-shadow-300 bg-clip-text text-transparent">
            agentic economy
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-in animate-in-delay-2 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          AI agents buy and sell API services with fully private USDC
          settlements. Balances, history, and intent stay confidential.
        </p>

        {/* CTA buttons */}
        <div className="animate-in animate-in-delay-3 flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <Link href="/services" className="btn-primary px-6 py-3 text-base">
            Browse Services
          </Link>
          <Link href="/agents" className="btn-secondary px-6 py-3 text-base">
            Deploy an Agent
          </Link>
        </div>

        {/* Protocol flow visualization */}
        <div className="animate-in animate-in-delay-4 w-full pt-8 sm:pt-12">
          <ProtocolFlowDiagram />
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line w-full max-w-lg" aria-hidden="true" />

      {/* How it Works */}
      <section className="w-full max-w-4xl py-16 sm:py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-shadow-500">
            Protocol
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Three steps to private commerce
          </h2>
        </div>

        <div className="relative grid gap-6 sm:grid-cols-3 sm:gap-8">
          {/* Connecting line behind cards (desktop) */}
          <div className="absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-shadow-800/40 to-transparent sm:block" aria-hidden="true" />

          {[
            {
              step: "01",
              title: "Register",
              desc: "List your API on the Solana-based service registry with USDC pricing. Discoverable by any agent.",
            },
            {
              step: "02",
              title: "Negotiate",
              desc: "Agents request services via HTTP. The x402 gateway returns payment terms. Settlement is automatic.",
            },
            {
              step: "03",
              title: "Settle",
              desc: "Payments route through MagicBlock\u2019s Private Payments API inside a TEE. Zero on-chain linkability.",
            },
          ].map((item) => (
            <div key={item.step} className="card group relative text-center">
              {/* Step number */}
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-shadow-700/30 bg-shadow-950/60 text-sm font-bold tabular-nums text-shadow-400 transition-colors group-hover:border-shadow-600/50 group-hover:bg-shadow-900/40">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid -- asymmetric layout */}
      <section className="w-full max-w-4xl py-16 sm:py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-shadow-500">
            Capabilities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Built for privacy by default
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="card group flex gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-shadow-800/30 bg-shadow-950/50 text-shadow-400 transition-colors group-hover:border-shadow-700/40 group-hover:text-shadow-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line w-full max-w-lg" aria-hidden="true" />

      {/* Tech Stack */}
      <section className="w-full max-w-4xl py-16 sm:py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-shadow-500">
            Infrastructure
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            The privacy stack
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="card group flex flex-col items-center gap-3 py-8 text-center"
            >
              <span className="font-mono text-xs font-bold tracking-wider text-shadow-600 transition-colors group-hover:text-shadow-400">
                {tech.mono}
              </span>
              <span className="text-sm font-semibold text-white">
                {tech.name}
              </span>
              <span className="text-xs text-slate-500">{tech.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-2xl pb-16 pt-8 text-center sm:pb-24">
        <div className="card relative overflow-hidden border-shadow-800/20 py-12">
          {/* Subtle grid background */}
          <div className="grid-pattern absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Start building private agent commerce
            </h2>
            <p className="mx-auto mb-8 max-w-md text-slate-400">
              Register your first API service or deploy an autonomous agent. The
              entire flow takes under five minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/services" className="btn-primary px-6 py-3">
                Register a Service
              </Link>
              <Link href="/agents" className="btn-secondary px-6 py-3">
                Deploy an Agent
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
