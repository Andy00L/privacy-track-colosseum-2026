import {
  Connection,
  Transaction,
  Keypair,
  SendOptions,
} from "@solana/web3.js";
import type {
  PrivatePaymentResponse,
  BalanceResponse,
  MintStatus,
  PaymentConfig,
  DepositParams,
  TransferParams,
  WithdrawParams,
} from "./types";

const DEFAULT_CONFIG: PaymentConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_MAGICBLOCK_PAYMENTS_API ||
    "https://payments.magicblock.app",
  rpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.devnet.solana.com",
};

export class PrivatePaymentsClient {
  private config: PaymentConfig;
  private connection: Connection;

  constructor(config?: Partial<PaymentConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.connection = new Connection(this.config.rpcUrl, "confirmed");
  }

  private async apiRequest<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Private Payments API error (${response.status}): ${error}`);
    }
    return response.json() as Promise<T>;
  }

  async deposit(params: DepositParams): Promise<PrivatePaymentResponse> {
    return this.apiRequest<PrivatePaymentResponse>("/deposit", "POST", {
      owner: params.ownerPublicKey,
      amount: params.amount,
      mint: params.mint,
    });
  }

  async transfer(params: TransferParams): Promise<PrivatePaymentResponse> {
    return this.apiRequest<PrivatePaymentResponse>("/transfer", "POST", {
      sender: params.senderPublicKey,
      recipient: params.recipientPublicKey,
      amount: params.amount,
      mint: params.mint,
    });
  }

  async withdraw(params: WithdrawParams): Promise<PrivatePaymentResponse> {
    return this.apiRequest<PrivatePaymentResponse>("/withdraw", "POST", {
      owner: params.ownerPublicKey,
      amount: params.amount,
      mint: params.mint,
      destination: params.destinationPublicKey,
    });
  }

  async getBalance(
    ownerPublicKey: string,
    mint: string
  ): Promise<BalanceResponse> {
    return this.apiRequest<BalanceResponse>(
      `/balance?owner=${encodeURIComponent(ownerPublicKey)}&mint=${encodeURIComponent(mint)}`
    );
  }

  async getMintStatus(mint: string): Promise<MintStatus> {
    return this.apiRequest<MintStatus>(`/mint-status?mint=${mint}`);
  }

  async initializeMint(
    payerPublicKey: string,
    mint: string
  ): Promise<PrivatePaymentResponse> {
    return this.apiRequest<PrivatePaymentResponse>("/initialize-mint", "POST", {
      payer: payerPublicKey,
      mint,
    });
  }

  async signAndSend(
    txResponse: PrivatePaymentResponse,
    signer: Keypair
  ): Promise<string> {
    const txBuffer = Buffer.from(txResponse.transactionBase64, "base64");
    const transaction = Transaction.from(txBuffer);
    transaction.sign(signer);

    const sendOptions: SendOptions = {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    };

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
      sendOptions
    );

    await this.connection.confirmTransaction(signature, "confirmed");
    return signature;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
