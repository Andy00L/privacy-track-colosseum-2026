import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { PrivatePaymentsClient } from "@/src/payments/client";

const paymentsClient = new PrivatePaymentsClient();

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function isValidAmount(value: string): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Missing 'action' field. Use: deposit, transfer, withdraw, balance, health" },
        { status: 400 }
      );
    }

    switch (action) {
      case "deposit": {
        if (!params.owner || !params.amount || !params.mint) {
          return NextResponse.json(
            { error: "deposit requires: owner, amount, mint" },
            { status: 400 }
          );
        }
        if (!isValidPublicKey(params.owner) || !isValidPublicKey(params.mint)) {
          return NextResponse.json(
            { error: "Invalid public key format for owner or mint" },
            { status: 400 }
          );
        }
        if (!isValidAmount(params.amount)) {
          return NextResponse.json(
            { error: "Amount must be a positive number" },
            { status: 400 }
          );
        }
        const depositResult = await paymentsClient.deposit({
          ownerPublicKey: params.owner,
          amount: params.amount,
          mint: params.mint,
        });
        return NextResponse.json(depositResult);
      }

      case "transfer": {
        if (!params.sender || !params.recipient || !params.amount || !params.mint) {
          return NextResponse.json(
            { error: "transfer requires: sender, recipient, amount, mint" },
            { status: 400 }
          );
        }
        if (
          !isValidPublicKey(params.sender) ||
          !isValidPublicKey(params.recipient) ||
          !isValidPublicKey(params.mint)
        ) {
          return NextResponse.json(
            { error: "Invalid public key format" },
            { status: 400 }
          );
        }
        if (!isValidAmount(params.amount)) {
          return NextResponse.json(
            { error: "Amount must be a positive number" },
            { status: 400 }
          );
        }
        const transferResult = await paymentsClient.transfer({
          senderPublicKey: params.sender,
          recipientPublicKey: params.recipient,
          amount: params.amount,
          mint: params.mint,
        });
        return NextResponse.json(transferResult);
      }

      case "withdraw": {
        if (!params.owner || !params.amount || !params.mint || !params.destination) {
          return NextResponse.json(
            { error: "withdraw requires: owner, amount, mint, destination" },
            { status: 400 }
          );
        }
        if (
          !isValidPublicKey(params.owner) ||
          !isValidPublicKey(params.mint) ||
          !isValidPublicKey(params.destination)
        ) {
          return NextResponse.json(
            { error: "Invalid public key format" },
            { status: 400 }
          );
        }
        if (!isValidAmount(params.amount)) {
          return NextResponse.json(
            { error: "Amount must be a positive number" },
            { status: 400 }
          );
        }
        const withdrawResult = await paymentsClient.withdraw({
          ownerPublicKey: params.owner,
          amount: params.amount,
          mint: params.mint,
          destinationPublicKey: params.destination,
        });
        return NextResponse.json(withdrawResult);
      }

      case "balance": {
        if (!params.owner || !params.mint) {
          return NextResponse.json(
            { error: "balance requires: owner, mint" },
            { status: 400 }
          );
        }
        if (!isValidPublicKey(params.owner) || !isValidPublicKey(params.mint)) {
          return NextResponse.json(
            { error: "Invalid public key format" },
            { status: 400 }
          );
        }
        const balanceResult = await paymentsClient.getBalance(
          params.owner,
          params.mint
        );
        return NextResponse.json(balanceResult);
      }

      case "health": {
        const healthy = await paymentsClient.healthCheck();
        return NextResponse.json({ healthy });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action. Use: deposit, transfer, withdraw, balance, health` },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Payment API error" },
      { status: 500 }
    );
  }
}
