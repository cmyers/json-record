import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyBlock, verifyChain } from "../src/verify";

const enc = new TextEncoder();

describe("tamper detection", () => {
  it("detects payload tampering", async () => {
    const block = await createBlock({ payload: enc.encode("original") });

    block.payload = enc.encode("modified");

    expect(await verifyBlock(block)).toBe(false);
  });

  it("detects broken chain linkage", async () => {
    const b1 = await createBlock({ payload: enc.encode("a") });
    const b2 = await createBlock({ payload: enc.encode("b"), prevBlock: b1 });

    b2.prevHash = "deadbeef";

    expect(await verifyChain([b1, b2])).toBe(false);
  });
});