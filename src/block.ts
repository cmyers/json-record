// src/block.ts
import { LedgerBlock, SignatureInfo } from "./types.js";
import { sha256 } from "./hash.js";

export interface CreateBlockOptions {
  payload: Uint8Array;
  prevBlock?: LedgerBlock | null;
  signature?: SignatureInfo;
}

/**
 * Create a new ledger block from a payload and optional previous block + signature.
 * - Computes payloadHash
 * - Builds a deterministic header
 * - Computes blockHash
 * - Links to prevBlock (if provided)
 */
export async function createBlock(
  options: CreateBlockOptions
): Promise<LedgerBlock> {
  const { payload, prevBlock, signature } = options;

  const payloadHash = await sha256(payload);
  const index = prevBlock ? prevBlock.index + 1 : 0;
  const timestamp = Date.now();
  const prevHash = prevBlock ? prevBlock.blockHash : null;

  const headerBytes = new TextEncoder().encode(
    JSON.stringify({
      index,
      timestamp,
      payloadHash,
      prevHash
    })
  );

  const blockHash = await sha256(headerBytes);

  const block: LedgerBlock = {
    index,
    timestamp,
    payload,
    payloadHash,
    prevHash,
    blockHash,
    signature
  };

  return block;
}