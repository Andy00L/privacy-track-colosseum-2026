import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-shadow-800/50 bg-shadow-950/30 px-4 py-1.5 text-sm text-shadow-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-shadow-400 animate-pulse" />
          Built on Solana with MagicBlock Privacy
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Private payments for the{" "}
          <span className="text-shadow-400">agentic economy</span>
        </h1>

        <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
          ShadowPay enables AI agents to buy and sell API services with fully
          private USDC settlements. Agent balances, transaction history, and
          service usage stay confidential.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Link href="/services" className="btn-primary">
            Browse Services
          </Link>
          <Link href="/agents" className="btn-secondary">
            Deploy an Agent
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="w-full max-w-4xl py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">
          How it works
        </h2>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-shadow-900/50 text-shadow-400">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Register a Service
            </h3>
            <p className="text-sm text-slate-400">
              List your API on the on-chain registry with pricing in USDC.
              Any agent can discover it.
            </p>
          </div>

          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-shadow-900/50 text-shadow-400">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Pay with x402
            </h3>
            <p className="text-sm text-slate-400">
              Agents request services via HTTP. The gateway returns 402 with
              payment terms. Payment is automatic.
            </p>
          </div>

          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-shadow-900/50 text-shadow-400">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Settle Privately
            </h3>
            <p className="text-sm text-slate-400">
              Payments route through MagicBlock&apos;s Private Payments API.
              No on-chain link between sender and receiver.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full max-w-4xl py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          Built with
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { name: "Solana", desc: "L1 Settlement" },
            { name: "MagicBlock PER", desc: "TEE Privacy" },
            { name: "Private Payments", desc: "Confidential USDC" },
            { name: "x402 Protocol", desc: "Agent Commerce" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="card flex flex-col items-center gap-2 py-8 text-center"
            >
              <span className="text-sm font-semibold text-shadow-400">
                {tech.name}
              </span>
              <span className="text-xs text-slate-500">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-2xl py-16 text-center">
        <div className="card border-shadow-800/30 bg-gradient-to-b from-shadow-950/20 to-midnight-900/60 py-12">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Ready to build private agent commerce?
          </h2>
          <p className="mb-6 text-slate-400">
            Register your first service or deploy an agent in minutes.
          </p>
          <Link href="/services" className="btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
