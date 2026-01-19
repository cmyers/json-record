import type { Hash } from "./types.js";

/**
 * Compute SHA-256 hash of input data, returning as a hex string.
 */
export async function sha256(data: Uint8Array): Promise<Hash> {
    const safe = new Uint8Array(data);
    const digest = await crypto.subtle.digest("SHA-256", safe);
    return bufferToHex(new Uint8Array(digest));
}

function bufferToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}