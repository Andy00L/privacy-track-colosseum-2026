# Demo Script - ShadowPay (3 minutes)

## Prerequisites
- Solana wallet (Phantom) with devnet SOL
- Browser with wallet extension
- Terminal for demo agent

## Demo Flow

### 0:00 - 0:30 | Introduction
> "ShadowPay enables AI agents to buy and sell API services with fully private USDC settlements on Solana."

- Show the landing page at `localhost:3000`
- Highlight the three-step flow: Register, Pay with x402, Settle Privately

### 0:30 - 1:00 | Connect Wallet & Register a Service
- Click "Connect Wallet" -> Phantom (devnet)
- Navigate to Services page
- Click "Register Service"
- Fill in:
  - Service ID: `weather-api`
  - Endpoint: `https://wttr.in/?format=j1`
  - Price: `0.0001` USDC
  - Description: `Real-time weather data`
- Click "Register on Solana"
- Show the service card appearing in the list
- Click "Pay & Access" on one of the demo services (e.g. `weather`)
- Show the x402 payment terms panel: HTTP 402 response with protocol version, network, USDC amount, recipient
- If wallet has devnet USDC, click "Pay with Wallet" to complete the full x402 flow

### 1:00 - 1:30 | Deploy an Agent
- Navigate to Agents page
- Click "Deploy Agent"
- Name: `trading-bot-alpha`
- Click "Deploy on Solana"
- Show the agent card in the list

### 1:30 - 2:15 | Run the Demo Agent (x402 Payment Flow)
- Switch to terminal
- Run: `npm run agent:demo`
- Walk through the output:
  1. "Discovering services..." -> finds 3 services
  2. "Selected: timestamp (0.000025 USDC)"
  3. "Step 1: Requesting service (expecting 402)" -> gets 402 back
  4. "Step 2: Building payment transaction" -> signs TX
  5. "Step 3: Sending payment and requesting service" -> gets data
- Show the response: actual timestamp data + payment receipt with signature

> "The agent just autonomously discovered a service, paid for it via x402 with private USDC, and received the data. The payment was routed through MagicBlock's Private Payments API - there is no traceable on-chain link between the agent and the service provider."

### 2:15 - 2:45 | Dashboard & Privacy
- Navigate to Dashboard
- Show wallet balance, services registered, agents deployed
- Explain: "Agent balances and transaction history are stored in MagicBlock's Private Ephemeral Rollup, running inside a TEE. Only the agent owner can query this state."

### 2:45 - 3:00 | Architecture & Wrap-up
- Show the architecture diagram (in docs or landing page)
- Key points:
  - x402 HTTP-native protocol: any agent SDK can integrate
  - MagicBlock PER + Private Payments: privacy without ZK complexity
  - On-chain service registry: composable and verifiable
  - First protocol combining x402 + MagicBlock privacy for agentic commerce

> "ShadowPay: private payments for the agentic economy."

## Terminal Commands Reference

```bash
# Start the dashboard
npm run dev

# Run the demo agent
npm run agent:demo

# Check services
curl http://localhost:3000/api/services

# Try x402 flow (get 402)
curl -v http://localhost:3000/api/services/weather
```
