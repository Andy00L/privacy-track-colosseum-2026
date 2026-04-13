#!/bin/bash
set -e

echo "=== ShadowPay Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install: https://nodejs.org"; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "Anchor CLI is required. Install: https://www.anchor-lang.com/docs/installation"; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "Solana CLI is required. Install: https://docs.solanalabs.com/cli/install"; exit 1; }

# Configure Solana for devnet
echo "Configuring Solana for devnet..."
solana config set --url devnet

# Generate keypair if needed
if [ ! -f ~/.config/solana/id.json ]; then
  echo "Generating Solana keypair..."
  solana-keygen new --no-bip39-passphrase
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Copy env file if needed
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Build Anchor program
echo "Building Anchor program..."
anchor build

# Airdrop devnet SOL
echo "Requesting devnet SOL airdrop..."
solana airdrop 2 --url devnet || echo "Airdrop failed (rate limited). Fund manually via https://faucet.solana.com"

echo ""
echo "=== Setup Complete ==="
echo "Run 'npm run dev' to start the dashboard"
echo "Run 'npm run agent:demo' to run the demo agent"
