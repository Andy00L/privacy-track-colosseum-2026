# Technical Decisions - ShadowPay

## D1: Next.js-only architecture (no Express.js gateway)

**Decision:** Use Next.js API routes with `@x402/next` for the payment gateway instead of a separate Express.js server.

**Rationale:** The Architect identified that running Express.js alongside Next.js is a micro-services anti-pattern for a hackathon. `@x402/next` provides `withX402()` wrapper for API routes, achieving the same x402 functionality in a single process. This simplifies setup to 3 commands, reduces deployment complexity, and makes the demo cleaner.

**Alternative considered:** Express.js + @x402/express as a separate gateway process.

## D2: Anchor program scope limited to registry

**Decision:** The Anchor program only handles service and agent registration (4 instructions). Payment logic lives in the TypeScript layer via MagicBlock APIs.

**Rationale:** Payment settlement is handled by MagicBlock's Private Payments API and the x402 facilitator. Duplicating this logic on-chain would add complexity without value. The on-chain registry provides the verifiable truth layer that agents query for service discovery.

## D3: Private Payments API for settlement, not direct SPL transfers

**Decision:** Route payments through MagicBlock's Private Payments API rather than direct SPL token transfers.

**Rationale:** Direct SPL transfers are fully visible on-chain. The Private Payments API routes USDC through a TEE-backed pool, breaking the on-chain link between sender and receiver. This is the core privacy feature and the primary differentiator vs other x402 implementations.

## D4: PER for agent state (SHOULD, not MUST)

**Decision:** PER integration is a "should have" feature, not blocking for the core demo.

**Rationale:** The core x402 + Private Payments flow works without PER. PER adds agent state privacy (balances, history) which enhances the story but isn't required for the payment demo. This de-risks the implementation.

## D5: Demo services use real external APIs

**Decision:** The demo services (weather, IP info, timestamp) proxy to real public APIs rather than returning mock data.

**Rationale:** Real API responses make the demo more convincing. If external APIs are down, the gateway returns a graceful fallback response noting the payment was still processed.

## D6: Dark theme with green/midnight palette

**Decision:** Custom color palette (shadow-green #14be6a, midnight-blue #0b1526) with Geist font.

**Rationale:** Avoids the AI-slop purple/blue gradient aesthetic. Green evokes "stealth/privacy" connotations. Geist is modern and distinctive from the common Inter/Roboto. The dark theme is standard for crypto/DeFi products.
