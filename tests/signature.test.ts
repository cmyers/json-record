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

    // create unsigned block first
    const unsigned = await createBlock({ payload });

    // sign the blockHash
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

  it("rejects a block with an invalid signature", async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    const payload = enc.encode("signed data");
    const unsigned = await createBlock({ payload });

    // sign wrong data
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey,
      enc.encode("wrong")
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
    expect(ok).toBe(false);
  });
});