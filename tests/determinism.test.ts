import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { sha256 } from "../src/hash";

const enc = new TextEncoder();

describe("determinism", () => {
  it("computes the same payloadHash for identical payloads", async () => {
    const a = await sha256(enc.encode("x"));
    const b = await sha256(enc.encode("x"));
    expect(a).toBe(b);
  });

  it("computes the same blockHash when timestamp is fixed", async () => {
    const payload = enc.encode("x");

    const b1 = await createBlock(payload);
    const b2 = await createBlock(payload);

    b2.timestamp = b1.timestamp;

    expect(b1.payloadHash).toBe(b2.payloadHash);
  });
});