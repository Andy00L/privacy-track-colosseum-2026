import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getAuthToken, verifyTeeIntegrity, buildPerRpcUrl } from "./auth";

export interface AgentState {
  publicKey: string;
  name: string;
  balance: string;
  totalPayments: number;
  lastActive: number;
}

export interface TransactionRecord {
  signature: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  serviceId: string;
}

export class PerClient {
  private connection: Connection | null = null;
  private authToken: string | null = null;
  private tokenExpiry = 0;

  async connect(signer: Keypair): Promise<void> {
    const integrity = await verifyTeeIntegrity();
    if (!integrity.verified) {
      throw new Error(
        "TEE integrity verification failed. Cannot establish secure connection."
      );
    }

    const auth = await getAuthToken(signer);
    this.authToken = auth.token;
    this.tokenExpiry = auth.expiresAt;
    this.connection = new Connection(auth.rpcUrl, "confirmed");
  }

  private ensureConnected(): Connection {
    if (!this.connection || !this.authToken) {
      throw new Error("PER client not connected. Call connect() first.");
    }
    if (Date.now() > this.tokenExpiry) {
      throw new Error("TEE auth token expired. Reconnect required.");
    }
    return this.connection;
  }

  async getAgentState(agentPubkey: PublicKey): Promise<AgentState | null> {
    const conn = this.ensureConnected();
    try {
      const accountInfo = await conn.getAccountInfo(agentPubkey);
      if (!accountInfo) return null;

      // Deserialize agent state from PER account data
      // The actual deserialization depends on the Anchor IDL
      return {
        publicKey: agentPubkey.toBase58(),
        name: "Agent",
        balance: "0",
        totalPayments: 0,
        lastActive: Date.now(),
      };
    } catch {
      return null;
    }
  }

  async getTransactionHistory(
    agentPubkey: PublicKey,
    limit = 10
  ): Promise<TransactionRecord[]> {
    const conn = this.ensureConnected();
    try {
      const signatures = await conn.getSignaturesForAddress(agentPubkey, {
        limit,
      });
      return signatures.map((sig) => ({
        signature: sig.signature,
        from: agentPubkey.toBase58(),
        to: "",
        amount: "0",
        timestamp: sig.blockTime || 0,
        serviceId: "",
      }));
    } catch {
      return [];
    }
  }

  async delegateAccount(
    accountPubkey: PublicKey,
    transaction: Transaction,
    signer: Keypair
  ): Promise<string> {
    const conn = this.ensureConnected();
    transaction.sign(signer);
    const signature = await conn.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );
    await conn.confirmTransaction(signature, "confirmed");
    return signature;
  }

  isConnected(): boolean {
    return (
      this.connection !== null &&
      this.authToken !== null &&
      Date.now() < this.tokenExpiry
    );
  }
}
