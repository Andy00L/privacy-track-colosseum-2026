# Implementation Plan  - ShadowPay

## 1. Stack Technique

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Smart contract | Anchor 0.32.1 (Rust) | Standard for Solana programs. Judges know it. Required for MagicBlock delegation. |
| Privacy layer | MagicBlock PER + Private Payments API | Core hackathon requirement. TEE-based privacy, confidential USDC. |
| Payment protocol | x402 (`@x402/svm`) | HTTP-native agent payments. Solana drives 65% of x402 volume. Brief explicitly mentions x402. |
| Frontend | Next.js 16 + Tailwind CSS | App Router for API routes, Turbopack default, React 19. |
| Wallet | `@solana/wallet-adapter-react` | Standard Solana wallet integration. Phantom, Backpack, Solflare support. |
| Payment gateway | Next.js API Routes + `@x402/next` | x402 middleware via `withX402()` wrapper on API routes. Single process with dashboard. |
| Agent runtime | TypeScript (Node.js) | Shared with gateway and frontend. Single language stack. |
| RPC | Solana devnet (default) | Free, no API key needed. Helius upgrade path if needed. |

**Why not alternatives:**
- **Rust-only backend:** Slower to iterate for hackathon, TypeScript is better for x402 integration
- **React (CRA):** No SSR, no API routes, no App Router
- **Python agents:** Would split the stack, extra complexity
- **External DB:** On-chain state + PER is sufficient, no DB needed

## 2. Architecture

```
           ┌──────────────────────────────────────────────┐
           │           Next.js 16 (App Router)            │
           │  Dashboard UI + x402 API Routes (withX402)   │
           └──────────────────┬───────────────────────────┘
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

### Data Flow: Agent Pays for a Service

1. Agent sends GET to Next.js API route (e.g. `/api/services/weather`)
2. `withX402()` middleware returns HTTP 402 with payment requirements (recipient, amount, USDC mint)
3. Agent builds private USDC transfer via Private Payments API (deposit + transfer)
4. Agent signs the unsigned transaction returned by the API
5. Agent retries with `X-Payment` header containing signed TX proof
6. `withX402()` verifies payment landed on-chain via x402 facilitator (the facilitator confirms the SPL transfer completed, independent of whether it was private-routed)
7. API route handler executes and returns service response to agent
8. Post-response webhook updates agent balance + history in PER (private state)

**Payment verification clarification (per Architect review):**
The x402 facilitator verifies that the SPL token transfer instruction in the signed TX actually transferred the required amount to the recipient token account. This works even with Private Payments API because the final settlement step produces a standard SPL transfer on Solana L1 that the facilitator can verify. The privacy is in the routing (no link between sender and receiver visible to observers), not in the final settlement instruction.

## 3. Features MVP Prioritized

### MUST (3 features  - core MVP)

**M1: Service Registry (Anchor Program)**
- Instructions: `register_service`, `register_agent`, `update_service`, `deregister_service`
- Accounts: `ServiceAccount` PDA (owner, endpoint, price, token_mint, description, active)
- Accounts: `AgentAccount` PDA (owner, name, active)
- PDAs derived from `[b"service", owner.key(), service_id]` and `[b"agent", owner.key()]`
- Tests: register, update, deregister, query

**M2: x402 Payment Gateway (Next.js API Routes)**
- Next.js API routes with `@x402/next` `withX402()` wrapper
- Route: `GET /api/services/[id]` returns 402 with payment requirements from on-chain registry
- `withX402()` handles X-Payment header verification via x402 facilitator
- On valid payment: route handler executes and returns service data
- Single process with dashboard  - no separate server
- Tests: 402 flow, payment verification, response delivery

**M3: Private Payment Settlement**
- Integration with MagicBlock Private Payments API
- Functions: `deposit()`, `transfer()`, `withdraw()`, `getBalance()`
- Handles unsigned TX building, client-side signing, and submission
- Confidential USDC between agents  - no traceable on-chain link
- Tests: deposit, transfer, withdraw, balance query

### SHOULD (2 features  - competitive edge)

**S1: PER Agent State**
- Agent balances and transaction history stored in MagicBlock PER
- TEE authentication for private state queries
- Delegation flow: agent state PDA delegated to PER
- Private state queries via authenticated TEE RPC
- Tests: delegation, state query, TEE auth

**S2: Web Dashboard**
- Next.js 14 App Router
- Pages: Landing (hero + how it works), Services (browse/register), Agents (deploy/monitor), Dashboard (balances, history)
- Wallet connection via `@solana/wallet-adapter-react`
- API routes calling gateway and payments modules
- Responsive, accessible, custom visual identity

### COULD (bonus if time permits)

**C1: Live Demo Agent**
- TypeScript agent that autonomously discovers services from registry
- Pays via x402 flow, logs results
- Configurable service preferences
- Pre-funded devnet wallet

**C2: Agent Reputation (TEE-attested)**
- Reputation scores computed inside PER
- TEE attestation proves score validity without revealing transaction details

## 4. Implementation Order

| Step | Feature | Dependencies | Est. Files |
|------|---------|-------------|-----------|
| 1 | Project scaffolding | None | 8 |
| 2 | M1: Service Registry (Anchor) | Step 1 | 3 |
| 3 | M3: Private Payments client | Step 1 | 3 |
| 4 | M2: x402 Payment Gateway | Steps 2, 3 | 4 |
| 5 | S1: PER Agent State | Steps 2, 3 | 3 |
| 6 | S2: Web Dashboard | Steps 2, 3, 4 | 12 |
| 7 | C1: Demo Agent | Steps 2, 3, 4 | 3 |
| 8 | UI/UX polish | Step 6 | - |
| 9 | Documentation | All | 5 |

## 5. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|-----------|
| MagicBlock Private Payments API unavailable on devnet | Can't demo private payments | Medium | Mock API fallback that simulates the flow, use mainnet beta if needed |
| PER TEE auth complexity | Delays PER integration | Medium | PER is SHOULD not MUST  - gateway works without it. Use documented TEE auth pattern from Shield Poker |
| x402 @x402/svm package issues | Can't build gateway | Low | Fallback to manual HTTP 402 implementation (we have full code from Solana guide) |
| Anchor program deployment on devnet | Build/deploy failures | Low | Test locally with `anchor test` first. Devnet is stable. |
| Solana devnet rate limits | Tests fail intermittently | Low | Add retry logic, use confirmed commitment |

## 6. External Needs

- **Solana devnet SOL:** Free via `solana airdrop` (no API key)
- **Devnet USDC tokens:** Mint test USDC on devnet (no API key)
- **MagicBlock API access:** Private Payments API is open beta (no API key for basic use)
- **No paid services required** for the MVP

## 7. Project Structure

```
shadowpay/
├── README.md
├── .env.example
├── .gitignore
├── Anchor.toml
├── Cargo.toml
├── package.json
├── tsconfig.json
├── scripts/
│   └── setup.sh
├── programs/
│   └── shadowpay/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
├── src/
│   ├── payments/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── per/
│   │   ├── client.ts
│   │   └── auth.ts
│   └── agent/
│       ├── runner.ts
│       └── discovery.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── providers.tsx
│   ├── services/
│   │   └── page.tsx
│   ├── agents/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── WalletButton.tsx
│   │   ├── ServiceCard.tsx
│   │   └── AgentCard.tsx
│   └── api/
│       ├── services/
│       │   └── route.ts
│       └── payments/
│           └── route.ts
├── tests/
│   └── shadowpay.ts
└── docs/
    ├── PLAN.md
    ├── ARCHITECTURE.md
    ├── COMPETITIVE-ANALYSIS.md
    ├── RESOURCES.md
    ├── DECISIONS.md
    ├── DEMO.md
    ├── SECURITY-AUDIT.md
    └── QUALITY-REPORT.md
```

## 8. Success Criteria

- Setup from scratch works in 3 commands
- Service registration on devnet works end-to-end
- x402 payment flow completes (402 -> payment -> 200)
- Private payment via MagicBlock API settles without on-chain trace
- Dashboard shows services, agents, and balances
- Demo agent autonomously discovers and pays for a service
- All README commands tested and functional
- Security audit PASS, Quality score >= 45/50
