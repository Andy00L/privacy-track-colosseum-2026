import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

const PER_TEE_URL =
  process.env.NEXT_PUBLIC_MAGICBLOCK_PER_URL ||
  "https://devnet-tee.magicblock.app";

export interface TeeAuthResult {
  token: string;
  rpcUrl: string;
  expiresAt: number;
}

export async function verifyTeeIntegrity(): Promise<{
  verified: boolean;
  attestation?: string;
}> {
  try {
    const response = await fetch(`${PER_TEE_URL}/attestation`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return { verified: false };
    }
    const data = (await response.json()) as { attestation: string };
    return { verified: true, attestation: data.attestation };
  } catch {
    return { verified: false };
  }
}

export async function getAuthToken(
  signer: Keypair
): Promise<TeeAuthResult> {
  const message = `ShadowPay TEE Auth ${Date.now()}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = signer.secretKey
    ? bs58.encode(
        Buffer.from(
          nacl.sign.detached(messageBytes, signer.secretKey)
        )
      )
    : "";

  const response = await fetch(`${PER_TEE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      publicKey: signer.publicKey.toBase58(),
      message,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`TEE auth failed: ${response.status}`);
  }

  const data = (await response.json()) as { token: string; expiresIn: number };
  return {
    token: data.token,
    rpcUrl: `${PER_TEE_URL}?token=${data.token}`,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
}

export function buildPerRpcUrl(token: string): string {
  return `${PER_TEE_URL}?token=${token}`;
}
