import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { readFileSync, existsSync } from "fs";
import { discoverServices, selectService } from "./discovery";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";
const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

function loadKeypair(): Keypair {
  const keyPath = process.env.AGENT_KEYPAIR_PATH || "./demo-agent.json";

  if (!existsSync(keyPath)) {
    console.log("No agent keypair found. Generating a new one...");
    const kp = Keypair.generate();
    console.log(`Agent public key: ${kp.publicKey.toBase58()}`);
    console.log(
      "Fund this wallet with devnet SOL and USDC before running the agent."
    );
    console.log(`  solana airdrop 2 ${kp.publicKey.toBase58()} --url devnet`);
    return kp;
  }

  const keyData = JSON.parse(readFileSync(keyPath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(keyData));
}

async function makePayment(
  connection: Connection,
  payer: Keypair,
  recipientTokenAccount: PublicKey,
  amount: number
): Promise<string> {
  const payerTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    payer.publicKey
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  });

  tx.add(
    createTransferInstruction(
      payerTokenAccount,
      recipientTokenAccount,
      payer.publicKey,
      amount
    )
  );

  tx.sign(payer);
  return tx.serialize().toString("base64");
}

async function requestService(
  serviceId: string,
  serializedTx: string
): Promise<unknown> {
  const paymentProof = {
    x402Version: 1,
    scheme: "exact",
    network: "solana-devnet",
    payload: { serializedTransaction: serializedTx },
  };

  const xPayment = Buffer.from(JSON.stringify(paymentProof)).toString(
    "base64"
  );

  const response = await fetch(`${GATEWAY_URL}/api/services/${serviceId}`, {
    headers: { "X-Payment": xPayment },
    signal: AbortSignal.timeout(30000),
  });

  return response.json();
}

async function main() {
  console.log("=== ShadowPay Demo Agent ===\n");

  const agent = loadKeypair();
  const connection = new Connection(SOLANA_RPC, "confirmed");

  console.log(`Agent: ${agent.publicKey.toBase58()}`);

  // Check SOL balance
  const solBalance = await connection.getBalance(agent.publicKey);
  console.log(`SOL Balance: ${solBalance / 1e9} SOL`);

  if (solBalance === 0) {
    console.log("\nNo SOL balance. Fund the agent wallet first.");
    console.log(
      `  solana airdrop 2 ${agent.publicKey.toBase58()} --url devnet`
    );
    return;
  }

  // Discover services
  console.log("\nDiscovering services...");
  let services;
  try {
    services = await discoverServices(GATEWAY_URL);
    console.log(`Found ${services.length} active services:`);
    for (const s of services) {
      console.log(`  - ${s.id}: ${s.description} (${s.priceUSDC} USDC)`);
    }
  } catch (err) {
    console.log("Service discovery failed. Is the gateway running?");
    console.log(`  Start it with: npm run dev`);
    console.log(`  Error: ${err instanceof Error ? err.message : err}`);
    return;
  }

  // Select cheapest service
  const service = selectService(services);
  if (!service) {
    console.log("No affordable services found.");
    return;
  }

  console.log(`\nSelected: ${service.id} (${service.priceUSDC} USDC)`);

  // Step 1: Request the service (get 402)
  console.log("\nStep 1: Requesting service (expecting 402)...");
  const quoteResponse = await fetch(
    `${GATEWAY_URL}/api/services/${service.id}`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (quoteResponse.status !== 402) {
    console.log(`Unexpected status: ${quoteResponse.status}`);
    return;
  }

  const quote = (await quoteResponse.json()) as {
    payment: { tokenAccount: string; amount: number };
  };
  console.log(`  Got 402: Pay ${quote.payment.amount} to ${quote.payment.tokenAccount}`);

  // Step 2: Build payment
  console.log("\nStep 2: Building payment transaction...");
  const recipientTokenAccount = new PublicKey(quote.payment.tokenAccount);

  let serializedTx: string;
  try {
    serializedTx = await makePayment(
      connection,
      agent,
      recipientTokenAccount,
      quote.payment.amount
    );
    console.log("  Transaction built and signed.");
  } catch (err) {
    console.log(
      `  Payment build failed: ${err instanceof Error ? err.message : err}`
    );
    console.log("  Make sure the agent has USDC tokens on devnet.");
    return;
  }

  // Step 3: Send payment and get service data
  console.log("\nStep 3: Sending payment and requesting service...");
  const result = await requestService(service.id, serializedTx);

  console.log("\nResult:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n=== Demo Complete ===");
}

main().catch(console.error);
