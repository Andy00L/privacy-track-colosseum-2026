# Resources & Documentation — ShadowPay

## MagicBlock

### Ephemeral Rollups (ER)
- **Quickstart:** https://docs.magicblock.gg/pages/ephemeral-rollups-ers/how-to-guide/quickstart
- **Core Concept:** Any Solana program can be upgraded with ER by adding delegation capabilities
- **SDK:** `cargo add ephemeral-rollups-sdk --features anchor`
- **Key Functions:** `delegate()`, `commit_accounts()`, `commit_and_undelegate_accounts()`
- **Macros:** `#[ephemeral]` for automatic undelegation callback injection
- **Router:** `https://devnet-router.magicblock.app` (devnet), `https://devnet.magicblock.app` (ER devnet)

### Private Ephemeral Rollups (PER)
- **Quickstart:** https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/how-to-guide/quickstart
- **API Reference:** https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/api-reference/per/introduction
- **Permission Program:** `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- **Delegation Program:** `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`
- **TEE Auth Flow:** `verifyTeeRpcIntegrity()` -> `getAuthToken()` with wallet signature -> `https://devnet-tee.magicblock.app?token=${token}`
- **TEE Validators:**
  - Devnet TEE: `https://devnet-tee.magicblock.app`
  - Mainnet TEE: regional endpoints available
- **Key Difference from ER:** PER adds compliance enforcement — node-level IP geofencing, OFAC sanction list, restricted jurisdictions at ingress
- **SDK minimum:** ephemeral-rollups-sdk v0.8.0+

### Private Payments API
- **Demo repo:** https://github.com/magicblock-labs/private-payments-demo
- **API Base:** `payments.magicblock.app`
- **Reference:** `payments.magicblock.app/reference`
- **How it works:** Users delegate USDC into a PER running inside TEE. Recipient details and release instructions encrypted client-side at delegation time. Built-in crank settles funds back to Solana automatically — no traceable on-chain link between sender and receiver.
- **Endpoints:** Deposit, Transfer, Withdraw, Initialize Mint, Balance queries
- **Response format:**
  ```json
  {
    "kind": "[operation-type]",
    "version": "legacy",
    "transactionBase64": "[encoded-tx]",
    "sendTo": "[destination-chain]",
    "recentBlockhash": "[hash]",
    "lastValidBlockHeight": 123,
    "instructionCount": 1,
    "requiredSigners": ["pubkey"]
  }
  ```
- **Status:** Beta on mainnet, available on devnet

### MagicBlock GitHub
- **Organization:** https://github.com/magicblock-labs
- **Ephemeral Validator:** https://github.com/magicblock-labs/ephemeral-validator
- **Scaffolder:** https://github.com/ankushKun/create-magicblock

### Required Software Versions
| Component | Version |
|-----------|---------|
| Solana CLI | 2.3.13 |
| Rust | 1.85.0 |
| Anchor | 0.32.1 |
| Node.js | 24.10.0 |

### ER Validator Addresses
- Mainnet Asia: `MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57`
- Devnet EU: `MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e`
- Localnet: `mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev`

---

## x402 Protocol

### Official Resources
- **Specification:** https://www.x402.org/
- **GitHub (Coinbase):** https://github.com/coinbase/x402
- **Solana Guide:** https://solana.com/developers/guides/getstarted/intro-to-x402
- **What is x402:** https://solana.com/x402/what-is-x402
- **Chainstack Tutorial:** https://chainstack.com/x402-on-solana-developer-guide-micro-payments/

### NPM Packages
- **@x402/svm** — SVM implementation with ExactSvmClient (V2 protocol, CAIP-2 identifiers)
  - `npm install @x402/svm`
  - Components: Client (make payments), Facilitator (verify/execute), Service (accept payments)
- **@x402/core** — Core protocol types and utilities
- **x402-solana** — Alternative community package

### Protocol Flow
1. Client requests protected endpoint
2. Server responds HTTP 402 with payment requirements (recipient, amount, token, mint)
3. Client builds + signs SPL transfer transaction
4. Client retries with `X-Payment` header (base64 JSON with serialized TX)
5. Server verifies, simulates, submits transaction
6. On confirmation, server responds 200 with protected content

### Key Implementation Pattern (Express.js)
```typescript
// Server: return 402 with payment quote
res.status(402).json({
  payment: {
    recipientWallet: RECIPIENT.toBase58(),
    tokenAccount: TOKEN_ACCOUNT.toBase58(),
    mint: USDC_MINT.toBase58(),
    amount: PRICE_USDC,
    cluster: "devnet"
  }
});

// Server: verify X-Payment header
const paymentData = JSON.parse(Buffer.from(xPaymentHeader, "base64").toString("utf-8"));
const tx = Transaction.from(Buffer.from(paymentData.payload.serializedTransaction, "base64"));
// Verify SPL transfer instruction, simulate, submit, confirm
```

### Facilitator Options
- **Corbits:** Solana-first SDK for x402 flows
- **PayAI:** Covers transaction fees — payai.network
- **Coinbase:** Reference implementation
- **ACK (Agent Commerce Kit):** Verifiable agent identity + receipt generation

### Solana x402 Stats
- Solana drives ~65% of x402 protocol transaction volume in 2026
- 400ms finality + $0.00025 transaction costs make it efficient for micropayments

---

## Solana Development

### Core Dependencies
- **@solana/web3.js** — Solana JavaScript SDK
- **@solana/spl-token** — SPL Token program interactions
- **@solana/wallet-adapter-react** — Wallet connection for React/Next.js
- **Anchor Framework:** https://www.anchor-lang.com/docs
- **Anchor Book:** https://book.anchor-lang.com/

### Devnet Resources
- **Devnet RPC:** `https://api.devnet.solana.com`
- **Devnet USDC Mint:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **SOL Faucet:** `solana airdrop 2 --url devnet`

---

## Frontend

### Next.js
- **Docs:** https://nextjs.org/docs
- **App Router:** https://nextjs.org/docs/app

### Tailwind CSS
- **Docs:** https://tailwindcss.com/docs

### Solana Wallet Adapter
- **Docs:** https://github.com/anza-xyz/wallet-adapter
- **React package:** `@solana/wallet-adapter-react`
- **Wallets:** Phantom, Backpack, Solflare

---

## Hackathon

### Colosseum
- **Platform:** https://colosseum.com/hackathon
- **Blog:** https://blog.colosseum.com/

### Privacy Hack (Jan 2026)
- **Page:** https://solana.com/privacyhack
- **Tracks:** Private Payments ($15k), Privacy Tooling ($15k), Open Track ($18k)
- **MagicBlock Bounty:** $5k total (1st: $2.5k, 2nd: $1.5k, 3rd: $1k)

### Reference Projects
- Heres: https://github.com/Joseph-hackathon/Heres
- Shield Poker: https://github.com/akshaydhayal/MagicBlock-Shield-Poker
- MagicBlock Private Payments Demo: https://github.com/magicblock-labs/private-payments-demo
