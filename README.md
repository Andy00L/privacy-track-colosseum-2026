# ShadowPay

**Private machine-to-machine payments for the agentic economy on Solana.**

ShadowPay is an x402-powered payment gateway that enables AI agents to buy and sell API services with fully private USDC settlements. Agent balances, transaction history, and service usage stay confidential through MagicBlock's Private Ephemeral Rollups.

## What it does

AI agents discover services from an on-chain registry, pay for them using the x402 HTTP protocol, and settle payments privately through MagicBlock's Private Payments API. No on-chain link between sender and receiver. No exposed transaction history. Just private, autonomous agent commerce.

## Why it matters

As AI agents increasingly transact autonomously, their payment patterns leak competitive intelligence. An agent's API usage, spending habits, and trading strategies become visible on-chain. ShadowPay makes agent commerce private by default, enabling a new class of confidential agentic applications on Solana.

## Quick Start

```bash
# Clone and setup
git clone https://github.com/Andy00L/privacy-track-colosseum-2026.git
cd privacy-track-colosseum-2026
bash scripts/setup.sh

# Start the dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Installation

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 24.x | [nodejs.org](https://nodejs.org) |
| Rust | >= 1.85 | [rustup.rs](https://rustup.rs) |
| Solana CLI | >= 2.3 | [docs.solanalabs.com](https://docs.solanalabs.com/cli/install) |
| Anchor CLI | >= 1.0 | [anchor-lang.com](https://www.anchor-lang.com/docs/installation) |

### Step-by-step

```bash
# 1. Install dependencies
npm install

# 2. Configure Solana for devnet
solana config set --url devnet

# 3. Build the Anchor program
anchor build

# 4. Copy environment config
cp .env.example .env

# 5. Start the dev server
npm run dev
```

## Configuration

All configuration is via environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana network | `devnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_MAGICBLOCK_PER_URL` | MagicBlock PER TEE endpoint | `https://devnet-tee.magicblock.app` |
| `NEXT_PUBLIC_MAGICBLOCK_PAYMENTS_API` | MagicBlock Private Payments API | `https://payments.magicblock.app` |
| `NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID` | ShadowPay on-chain program | `85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK` |
| `NEXT_PUBLIC_USDC_MINT` | USDC token mint (devnet) | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| `NEXT_PUBLIC_TREASURY_WALLET` | Payment recipient wallet | (set yours) |
| `AGENT_KEYPAIR_PATH` | Path to demo agent keypair | `./demo-agent.json` |

## Features

### On-chain Service Registry
Register API services on Solana with pricing in USDC. Any agent can discover available services by querying the program's PDAs. Owners can update or deregister their services.

### x402 Payment Gateway
HTTP-native payment flow using the x402 protocol. Agents request a service endpoint, receive a 402 response with payment terms, and retry with a signed payment proof. The gateway verifies, settles, and forwards to the service provider.

### Private Payment Settlement
Payments route through MagicBlock's Private Payments API. USDC is delegated into a Private Ephemeral Rollup running inside a Trusted Execution Environment (Intel TDX). The built-in crank settles funds back to Solana with no traceable on-chain link between sender and receiver.

### Private Agent State (PER)
Agent balances and transaction history are stored in MagicBlock's PER. TEE authentication ensures only the agent owner can query this state. On-chain observers see delegation metadata but not the private data.

### Web Dashboard
Next.js interface for managing services and agents. Connect a Solana wallet to register services, deploy agents, and view your dashboard with balances and activity.

### Demo Agent
Pre-built TypeScript agent that autonomously discovers services, pays via x402, and logs results. Run with `npm run agent:demo`.

## Architecture

```
         ┌──────────────────────────────────────────┐
         │         Next.js 14 (App Router)           │
         │  Dashboard UI + x402 API Routes           │
         └──────────────────┬───────────────────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ▼               ▼                ▼
   ┌──────────────┐ ┌────────────┐  ┌──────────────────┐
   │  Service      │ │ MagicBlock │  │  MagicBlock      │
   │  Registry     │ │ PER (TEE)  │  │  Private Payments│
   │  (Anchor PDA) │ │ Agent State│  │  API             │
   └──────┬───────┘ └────────────┘  └──────────────────┘
          │
          ▼
   ┌──────────┐
   │  Solana   │
   │  Devnet   │
   └──────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed diagrams and data flows.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Smart contract | [Anchor](https://www.anchor-lang.com/docs) (Rust) | Standard for Solana programs, MagicBlock SDK compatible |
| Privacy | [MagicBlock PER](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/how-to-guide/quickstart) + [Private Payments API](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/api-reference/per/introduction) | TEE-based privacy, confidential USDC transfers |
| Payment protocol | [x402](https://www.x402.org/) | HTTP-native agent payments, Solana drives 65% of x402 volume |
| Frontend | [Next.js 14](https://nextjs.org/docs) + [Tailwind CSS](https://tailwindcss.com/docs) | App Router with API routes, fast to build |
| Wallet | [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) | Phantom, Backpack, Solflare support |

## API Documentation

### Service Discovery
```
GET /api/services
```
Returns all registered services with pricing.

### x402 Payment Flow
```
GET /api/services/:id
```
- Without payment: returns `402` with payment requirements
- With `X-Payment` header: verifies payment, returns service data

### Private Payments
```
POST /api/payments
```
Body: `{ action: "deposit" | "transfer" | "withdraw" | "balance" | "health", ...params }`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full data flow.

## Project Structure

```
shadowpay/
├── programs/shadowpay/     # Anchor program (Rust)
│   ├── src/
│   │   ├── lib.rs          # Program entry point
│   │   ├── state.rs        # Account definitions
│   │   ├── instructions/   # Instruction handlers
│   │   ├── error.rs        # Custom errors
│   │   └── constants.rs    # Seeds and limits
│   └── tests/              # Rust tests (litesvm)
├── app/                    # Next.js frontend
│   ├── page.tsx            # Landing page
│   ├── services/           # Service management
│   ├── agents/             # Agent management
│   ├── dashboard/          # User dashboard
│   ├── components/         # Shared components
│   └── api/                # API routes (x402 gateway)
├── src/
│   ├── payments/           # MagicBlock Private Payments client
│   ├── per/                # PER/TEE auth client
│   └── agent/              # Demo agent runner
├── docs/                   # Documentation
├── scripts/setup.sh        # One-liner setup
└── .env.example            # Environment template
```

## Known Limitations

- **Devnet only:** The demo runs on Solana devnet. MagicBlock Private Payments API availability may vary.
- **Facilitator dependency:** x402 payment verification depends on the transaction being confirmed on-chain, which adds latency (~400ms on Solana).
- **PER auth token expiry:** TEE auth tokens expire and require reconnection. The client handles this but the UX could be smoother.
- **Demo agent keypair:** The demo agent uses a local keypair file. In production, agents would use delegated signing via session keys.

## Documentation and Resources

- [MagicBlock Ephemeral Rollups Quickstart](https://docs.magicblock.gg/pages/ephemeral-rollups-ers/how-to-guide/quickstart)
- [MagicBlock Private Ephemeral Rollups Quickstart](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/how-to-guide/quickstart)
- [MagicBlock PER API Reference](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/api-reference/per/introduction)
- [x402 Protocol Specification](https://www.x402.org/)
- [x402 on Solana Guide](https://solana.com/developers/guides/getstarted/intro-to-x402)
- [Anchor Framework Documentation](https://www.anchor-lang.com/docs)
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT
