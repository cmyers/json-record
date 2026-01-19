import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyChain } from "../src/verify";

const enc = new TextEncoder();

describe("chain linking", () => {
  it("creates a valid two-block chain", async () => {
    const b1 = await createBlock({ payload: enc.encode("a") });
    const b2 = await createBlock({ payload: enc.encode("b"), prevBlock: b1 });

    expect(await verifyChain([b1, b2])).toBe(true);
  });
});