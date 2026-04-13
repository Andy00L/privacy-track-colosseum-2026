import { NextRequest, NextResponse } from "next/server";
import { PrivatePaymentsClient } from "@/src/payments/client";

const paymentsClient = new PrivatePaymentsClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing 'action' field. Use: deposit, transfer, withdraw, balance" },
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
          { error: `Unknown action '${action}'. Use: deposit, transfer, withdraw, balance, health` },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Payment API error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
