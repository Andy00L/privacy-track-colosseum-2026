import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID ||
    "85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK"
);

const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

const SERVICE_SEED = Buffer.from("service");
const AGENT_SEED = Buffer.from("agent");

// Anchor discriminators from the IDL
const REGISTER_SERVICE_DISC = Buffer.from([11, 133, 158, 232, 193, 19, 229, 73]);
const REGISTER_AGENT_DISC = Buffer.from([135, 157, 66, 195, 2, 113, 175, 30]);
const SERVICE_ACCOUNT_DISC = Buffer.from([72, 33, 73, 146, 208, 186, 107, 192]);
const AGENT_ACCOUNT_DISC = Buffer.from([241, 119, 69, 140, 233, 9, 112, 50]);

export interface ServiceData {
  owner: string;
  serviceId: string;
  endpoint: string;
  price: number;
  tokenMint: string;
  description: string;
  active: boolean;
  createdAt: number;
}

export interface AgentData {
  owner: string;
  name: string;
  active: boolean;
  totalPayments: number;
  createdAt: number;
}

function encodeString(s: string): Buffer {
  const buf = Buffer.alloc(4 + s.length);
  buf.writeUInt32LE(s.length, 0);
  buf.write(s, 4);
  return buf;
}

function encodeBN(n: number): Buffer {
  const buf = Buffer.alloc(8);
  const bn = BigInt(n);
  buf.writeBigUInt64LE(bn);
  return buf;
}

function encodePubkey(pk: PublicKey): Buffer {
  return pk.toBuffer();
}

function decodeString(data: Buffer, offset: number): [string, number] {
  const len = data.readUInt32LE(offset);
  const str = data.subarray(offset + 4, offset + 4 + len).toString("utf-8");
  return [str, offset + 4 + len];
}

export function deriveServicePda(owner: PublicKey, serviceId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SERVICE_SEED, owner.toBuffer(), Buffer.from(serviceId)],
    PROGRAM_ID
  );
  return pda;
}

export function deriveAgentPda(owner: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [AGENT_SEED, owner.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export function buildRegisterServiceIx(
  owner: PublicKey,
  serviceId: string,
  endpoint: string,
  priceLamports: number,
  description: string,
  tokenMint: PublicKey = USDC_MINT
): TransactionInstruction {
  const servicePda = deriveServicePda(owner, serviceId);

  // Encode args: RegisterServiceArgs { service_id, endpoint, price_lamports, token_mint, description }
  const data = Buffer.concat([
    REGISTER_SERVICE_DISC,
    encodeString(serviceId),
    encodeString(endpoint),
    encodeBN(priceLamports),
    encodePubkey(tokenMint),
    encodeString(description),
  ]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: servicePda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function buildRegisterAgentIx(
  owner: PublicKey,
  name: string
): TransactionInstruction {
  const agentPda = deriveAgentPda(owner);

  // Encode args: RegisterAgentArgs { name }
  const data = Buffer.concat([REGISTER_AGENT_DISC, encodeString(name)]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function buildAndSignTx(
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[]
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(message);
}

function decodeServiceAccount(data: Buffer): ServiceData | null {
  try {
    // First 8 bytes are the discriminator
    const disc = data.subarray(0, 8);
    if (!disc.equals(SERVICE_ACCOUNT_DISC)) return null;

    let offset = 8;
    // owner: Pubkey (32 bytes)
    const owner = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
    offset += 32;
    // service_id: String
    const [serviceId, o1] = decodeString(data, offset);
    offset = o1;
    // endpoint: String
    const [endpoint, o2] = decodeString(data, offset);
    offset = o2;
    // price_lamports: u64
    const price = Number(data.readBigUInt64LE(offset));
    offset += 8;
    // token_mint: Pubkey
    const tokenMint = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
    offset += 32;
    // description: String
    const [description, o3] = decodeString(data, offset);
    offset = o3;
    // active: bool
    const active = data[offset] === 1;
    offset += 1;
    // created_at: i64
    const createdAt = Number(data.readBigInt64LE(offset));

    return { owner, serviceId, endpoint, price, tokenMint, description, active, createdAt };
  } catch {
    return null;
  }
}

function decodeAgentAccount(data: Buffer): AgentData | null {
  try {
    const disc = data.subarray(0, 8);
    if (!disc.equals(AGENT_ACCOUNT_DISC)) return null;

    let offset = 8;
    const owner = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
    offset += 32;
    const [name, o1] = decodeString(data, offset);
    offset = o1;
    const active = data[offset] === 1;
    offset += 1;
    const totalPayments = Number(data.readBigUInt64LE(offset));
    offset += 8;
    const createdAt = Number(data.readBigInt64LE(offset));

    return { owner, name, active, totalPayments, createdAt };
  } catch {
    return null;
  }
}

export async function fetchAllServices(connection: Connection): Promise<ServiceData[]> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(SERVICE_ACCOUNT_DISC) } },
      ],
    });

    const services: ServiceData[] = [];
    for (const { account } of accounts) {
      const decoded = decodeServiceAccount(Buffer.from(account.data));
      if (decoded) services.push(decoded);
    }
    return services;
  } catch {
    return [];
  }
}

export async function fetchAllAgents(connection: Connection): Promise<AgentData[]> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(AGENT_ACCOUNT_DISC) } },
      ],
    });

    const agents: AgentData[] = [];
    for (const { account } of accounts) {
      const decoded = decodeAgentAccount(Buffer.from(account.data));
      if (decoded) agents.push(decoded);
    }
    return agents;
  } catch {
    return [];
  }
}
