export interface PrivatePaymentResponse {
  kind: string;
  version: string;
  transactionBase64: string;
  sendTo: "base-chain" | "ephemeral-rollup";
  recentBlockhash: string;
  lastValidBlockHeight: number;
  instructionCount: number;
  requiredSigners: string[];
}

export interface BalanceResponse {
  balance: string;
  decimals: number;
  mint: string;
}

export interface MintStatus {
  initialized: boolean;
  mint: string;
}

export interface PaymentConfig {
  apiBaseUrl: string;
  rpcUrl: string;
}

export interface DepositParams {
  ownerPublicKey: string;
  amount: string;
  mint: string;
}

export interface TransferParams {
  senderPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  mint: string;
}

export interface WithdrawParams {
  ownerPublicKey: string;
  amount: string;
  mint: string;
  destinationPublicKey: string;
}
