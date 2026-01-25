import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyBlock } from "../src/verify";

const enc = new TextEncoder();

async function generateKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true,
    ["sign", "verify"]
  );
}

describe("signature verification", () => {
  it("verifies a signed block", async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    const payload = enc.encode("signed data");

    const unsigned = await createBlock(payload);

    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey,
      new TextEncoder().encode(unsigned.blockHash)
    );

    const signed = {
      ...unsigned,
      signature: {
        algorithm: { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        signature
      }
    };

    const ok = await verifyBlock(signed);
    expect(ok).toBe(true);
  });

});