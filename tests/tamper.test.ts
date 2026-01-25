import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyBlock, verifyChain } from "../src/verify";

const enc = new TextEncoder();

describe("tamper detection", () => {
  it("detects payload tampering", async () => {
    const block = await createBlock( enc.encode("original"));

    block.payload = enc.encode("modified");

    expect(await verifyBlock(block)).toBe(false);
  });

  it("detects broken chain linkage", async () => {
    const b1 = await createBlock(enc.encode("a"));
    const b2 = await createBlock(enc.encode("b"), b1);

    b2.prevHash = "brokenlinkhash";

    expect(await verifyChain([b1, b2])).toBe(false);
  });
});