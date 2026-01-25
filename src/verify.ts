import type { LedgerBlock } from "./types.js";
import { sha256 } from "./hash.js";

function buildHeaderBytes(block: LedgerBlock): Uint8Array {
  const header = {
    index: block.index,
    timestamp: block.timestamp,
    payloadHash: block.payloadHash,
    prevHash: block.prevHash
  };

  return new TextEncoder().encode(JSON.stringify(header));
}

export async function verifyBlock(block: LedgerBlock): Promise<boolean> {
  const computedPayloadHash = await sha256(block.payload);
  if (computedPayloadHash !== block.payloadHash) {
    return false;
  }

  const headerBytes = buildHeaderBytes(block);
  const computedBlockHash = await sha256(headerBytes);
  if (computedBlockHash !== block.blockHash) {
    return false;
  }

  return true;
}

export async function verifyChain(blocks: LedgerBlock[]): Promise<boolean> {
  if (blocks.length === 0) return true;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (i === 0) {
      if (block.prevHash !== null) return false;
      if (block.index !== 0) return false;
    } else {
      const prev = blocks[i - 1];
      if (block.prevHash !== prev.blockHash) return false;
      if (block.index !== prev.index + 1) return false;
    }

    const ok = await verifyBlock(block);
    if (!ok) return false;
  }

  return true;
}