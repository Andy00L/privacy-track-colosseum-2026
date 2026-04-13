# Competitive Analysis — ShadowPay

## 1. Past Privacy Track Winners & Notable Submissions

### 1.1 Heres — Privacy-Preserving Capsule Protocol
- **Link:** https://github.com/Joseph-hackathon/Heres
- **What it does:** Digital asset inheritance via time-locked intent capsules on Solana. Users lock SOL with beneficiary instructions that execute automatically after inactivity thresholds.
- **Stack:** Next.js 14, Anchor (Rust), MagicBlock ER/PER SDK, Helius API, Tailwind CSS, GSAP
- **MagicBlock Usage:** Dual ER/PER configuration. TEE for private condition evaluation and beneficiary logic. Only execution outcomes commit to Solana.
- **Winning Feature:** Permissionless execution after inactivity + private beneficiary logic in TEE
- **README Quality:** Excellent — detailed architecture, clear problem statement, well-documented flows
- **Weaknesses:**
  - Single-use case (inheritance), limited market appeal
  - Complex two-transaction delegation flow (Solana + rollup)
  - No x402 or agentic commerce angle
  - Crank-based execution adds latency (~15 min intervals)

### 1.2 Shield Poker — Private Texas Hold'em on Solana
- **Link:** https://github.com/akshaydhayal/MagicBlock-Shield-Poker
- **What it does:** Decentralized poker where cards are processed in TEE, never visible on L1 explorers. Two-phase commit: TEE for gameplay, L1 for fund settlement.
- **Stack:** Next.js, Anchor (Rust), MagicBlock PER/TEE (Intel TDX), Tapestry Protocol
- **MagicBlock Usage:** `#[ephemeral]` macro on game accounts, protocol-level ACLs for card visibility, ~50ms betting latency
- **Winning Feature:** "Cards are never visible on L1 Explorers" — first instant-execution private poker
- **README Quality:** Good — clear architecture, demo screenshots, code structure documented
- **Weaknesses:**
  - Gaming niche only
  - Relies on Tapestry for social layer (extra dependency)
  - No payment privacy beyond game stakes
  - No agent/commerce angle

### 1.3 Cloak — Private Payments Product
- **Link:** Found in Cypherpunk Hackathon (Stablecoin Track, 3rd place, $25,000)
- **What it does:** "An OS private payments product" on Solana
- **Stack:** Details limited
- **Winning Feature:** Private stablecoin payments
- **Weaknesses:**
  - Minimal public documentation found
  - Limited to payments (no composability story)
  - No agentic commerce or x402 integration

### 1.4 Loyal — Private AI Assistant via PER
- **Source:** Referenced in Colosseum Privacy Track
- **What it does:** Private AI assistant using MagicBlock PER for confidential interactions
- **Winning Feature:** AI + privacy combination
- **Weaknesses:**
  - AI assistant focus, not payment infrastructure
  - No x402 or agent-to-agent commerce

### 1.5 MagicBlock Private Payments Demo (Official Reference)
- **Link:** https://github.com/magicblock-labs/private-payments-demo
- **What it does:** Simple payment app demonstrating Private Ephemeral Rollup payments
- **Stack:** TypeScript (95.9%), Next.js, CSS
- **Significance:** This is MagicBlock's own demo — our implementation should surpass it significantly

## 2. Similar Projects in the Ecosystem

### 2.1 Light Protocol (ZK Compression)
- **Link:** https://github.com/Lightprotocol/light-protocol
- **Stars:** 500+, very active
- **What it does:** ZK compression for Solana — compressed accounts using Groth16 proofs
- **Strength:** Production-grade ZK infrastructure, 1000x cost reduction
- **Weakness:** Compression is primary value prop, not full privacy. Complex ZK circuits.
- **Pattern:** Concurrent Merkle trees, Forester service, custom RPC (Photon)

### 2.2 Arcium (MPC Network)
- **Link:** https://github.com/arcium-hq
- **What it does:** Multi-party computation for Solana — confidential computation on encrypted data
- **Strength:** MPC enables computation on encrypted data (stronger than transfer privacy)
- **Weakness:** Computationally expensive, high latency, complex DX
- **Pattern:** Secret sharing, on-chain verification of off-chain computation

### 2.3 Solana Confidential Transfers (Token-2022)
- **What it does:** Native encrypted token balances using ElGamal + Bulletproofs
- **Strength:** Native to Solana, battle-tested, auditor key for compliance
- **Weakness:** Only hides amounts — addresses still public. Not composable with standard SPL tokens.
- **Pattern:** Pending balance model, range proofs, auditor key

### 2.4 x402 Protocol (Coinbase)
- **Link:** https://github.com/coinbase/x402
- **What it does:** HTTP 402 payment protocol for machine-to-machine payments
- **Strength:** Clean HTTP-native flow, agent-friendly, Solana drives 65% of protocol volume in 2026
- **Weakness:** No native privacy — payments visible on-chain
- **Pattern:** HTTP 402 middleware, facilitator verification, X-Payment header

## 3. Winning Patterns Identified

1. **MagicBlock integration depth matters** — Winners use ER/PER meaningfully, not just as a wrapper. TEE-based privacy with `#[ephemeral]` macros and protocol-level ACLs score highest.

2. **Compliance-by-design** — Every successful privacy project includes selective disclosure or auditor keys. Pure anonymity gets ignored by judges.

3. **Working demo over paper architecture** — Judges favor 3 working features over 20 promised ones.

4. **Developer experience as differentiator** — Projects with clean SDKs and simple integration outperform technically superior but complex alternatives.

5. **Composition with existing Solana** — Privacy features that plug into existing infra (wallets, DeFi) are more compelling than standalone tools.

6. **Clear "so what" narrative** — Projects solving concrete problems ("agents need private payments") beat abstract infrastructure ("generic privacy layer").

## 4. Our Differentiator

**No existing project combines x402 HTTP-native agentic payments with MagicBlock's Private Payments API and PER to enable fully private agent-to-agent commerce on Solana.**

The gap is clear:
- Privacy projects (Heres, Shield Poker, Light) are human-centric, not agent-centric
- Agent projects (x402 ecosystem) have zero privacy — all payments visible on-chain
- Nobody has built **private agent-to-agent payments** using MagicBlock's TEE infrastructure

ShadowPay fills this gap: x402 protocol flow + Private Payments API for confidential USDC + PER for private agent state = the first private agentic commerce protocol on Solana.
