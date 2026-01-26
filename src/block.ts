import type { LedgerBlock } from "./types.js";
import { sha256 } from "./hash.js";

export async function createBlock(
  payload: Uint8Array,
  prevBlock?: LedgerBlock | null
): Promise<LedgerBlock> {
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
    blockHash
  };

  return block;
}