import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET;
if (!TREASURY_WALLET) {
  console.warn(
    "NEXT_PUBLIC_TREASURY_WALLET is not set. Payment verification will reject all payments."
  );
}
const TREASURY = TREASURY_WALLET ? new PublicKey(TREASURY_WALLET) : null;

// Service registry (in production, read from on-chain)
const DEMO_SERVICES: Record<
  string,
  { endpoint: string; price: number; description: string }
> = {
  weather: {
    endpoint: "https://wttr.in/?format=j1",
    price: 100, // 0.0001 USDC in base units
    description: "Real-time weather data for any location",
  },
  "ip-info": {
    endpoint: "https://httpbin.org/ip",
    price: 50,
    description: "IP geolocation information",
  },
  timestamp: {
    endpoint: "https://worldtimeapi.org/api/timezone/Etc/UTC",
    price: 25,
    description: "Accurate UTC timestamp from atomic clock",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: serviceId } = await params;
  const service = DEMO_SERVICES[serviceId];

  if (!service) {
    return NextResponse.json(
      { error: `Service '${serviceId}' not found` },
      { status: 404 }
    );
  }

  // Check for x402 payment header
  const xPayment = request.headers.get("x-payment");

  if (!xPayment) {
    if (!TREASURY) {
      return NextResponse.json(
        { error: "Payment gateway not configured: treasury wallet missing" },
        { status: 503 }
      );
    }

    // Return 402 with payment requirements
    const treasuryKey = TREASURY;
    const tokenAccount = (
      await getAssociatedTokenAddress(USDC_MINT, treasuryKey)
    ).toBase58();

    return NextResponse.json(
      {
        x402Version: 1,
        scheme: "exact",
        network: "solana-devnet",
        payment: {
          recipientWallet: treasuryKey.toBase58(),
          tokenAccount,
          mint: USDC_MINT.toBase58(),
          amount: service.price,
          amountUSDC: service.price / 1_000_000,
          description: `Access to ${serviceId}: ${service.description}`,
        },
      },
      { status: 402 }
    );
  }

  // Verify payment
  try {
    const paymentData = JSON.parse(
      Buffer.from(xPayment, "base64").toString("utf-8")
    );

    if (!paymentData.payload?.serializedTransaction) {
      return NextResponse.json(
        { error: "Invalid payment proof: missing serialized transaction" },
        { status: 402 }
      );
    }

    if (!TREASURY) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 }
      );
    }

    const connection = new Connection(SOLANA_RPC, "confirmed");
    const txBuffer = Buffer.from(
      paymentData.payload.serializedTransaction,
      "base64"
    );
    const tx = Transaction.from(txBuffer);

    // Compute expected treasury token account
    const expectedDestination = await getAssociatedTokenAddress(
      USDC_MINT,
      TREASURY
    );

    // Verify SPL Token transfer instruction with destination and amount validation
    let validTransfer = false;
    for (const ix of tx.instructions) {
      if (ix.programId.equals(TOKEN_PROGRAM_ID)) {
        // SPL Token Transfer instruction: opcode 3, amount at bytes 1-8
        if (ix.data.length >= 9 && ix.data[0] === 3) {
          const transferAmount = Number(ix.data.readBigUInt64LE(1));

          // Validate destination is treasury's token account
          const destination = ix.keys.length >= 2 ? ix.keys[1].pubkey : null;
          if (
            destination &&
            destination.equals(expectedDestination) &&
            transferAmount >= service.price
          ) {
            validTransfer = true;
            break;
          }
        }
      }
    }

    if (!validTransfer) {
      return NextResponse.json(
        { error: "Invalid payment: transfer must send sufficient USDC to the treasury" },
        { status: 402 }
      );
    }

    // Simulate transaction
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      return NextResponse.json(
        { error: "Payment transaction simulation failed" },
        { status: 402 }
      );
    }

    // Submit transaction
    const signature = await connection.sendRawTransaction(txBuffer, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await connection.confirmTransaction(signature, "confirmed");

    // Payment verified - fetch and return service data
    let serviceData: unknown;
    try {
      const serviceResponse = await fetch(service.endpoint, {
        signal: AbortSignal.timeout(10000),
      });
      serviceData = await serviceResponse.json();
    } catch {
      serviceData = {
        note: "Service endpoint unavailable, but payment was processed",
        timestamp: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      data: serviceData,
      payment: {
        verified: true,
        signature,
        amount: service.price,
        amountUSDC: service.price / 1_000_000,
        service: serviceId,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 402 }
    );
  }
}
