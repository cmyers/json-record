// src/verify.ts
import type { LedgerBlock } from "./types.js";
import { sha256 } from "./hash.js";

/**
 * Reconstruct the deterministic header for a block.
 * Must match block.ts exactly.
 */
function buildHeaderBytes(block: LedgerBlock): Uint8Array {
  const header = {
    index: block.index,
    timestamp: block.timestamp,
    payloadHash: block.payloadHash,
    prevHash: block.prevHash
  };

  return new TextEncoder().encode(JSON.stringify(header));
}

/**
 * Verify a single block:
 * - payloadHash matches payload
 * - blockHash matches header
 * - signature (if present) verifies blockHash
 */
export async function verifyBlock(block: LedgerBlock): Promise<boolean> {
  // 1. Verify payload hash
  const computedPayloadHash = await sha256(block.payload);
  if (computedPayloadHash !== block.payloadHash) {
    return false;
  }

  // 2. Verify block hash
  const headerBytes = buildHeaderBytes(block);
  const computedBlockHash = await sha256(headerBytes);
  if (computedBlockHash !== block.blockHash) {
    return false;
  }

  // 3. Verify signature (if present)
  if (block.signature) {
    const { algorithm, publicKey, signature } = block.signature;

    // blockHash is a hex string → convert to bytes
    const hashBytes = new TextEncoder().encode(block.blockHash);

    const ok = await crypto.subtle.verify(
      algorithm,
      publicKey,
      signature,
      hashBytes
    );

    if (!ok) return false;
  }

  return true;
}

/**
 * Verify an entire chain:
 * - each block verifies individually
 * - prevHash matches the previous block's blockHash
 * - index increments correctly
 */
export async function verifyChain(blocks: LedgerBlock[]): Promise<boolean> {
  if (blocks.length === 0) return true;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check linkage
    if (i === 0) {
      if (block.prevHash !== null) return false;
      if (block.index !== 0) return false;
    } else {
      const prev = blocks[i - 1];
      if (block.prevHash !== prev.blockHash) return false;
      if (block.index !== prev.index + 1) return false;
    }

    // Check block integrity
    const ok = await verifyBlock(block);
    if (!ok) return false;
  }

  return true;
}