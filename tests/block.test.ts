import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyBlock } from "../src/verify";

const enc = new TextEncoder();

describe("block creation", () => {
  it("creates a valid block", async () => {
    const block = await createBlock({ payload: enc.encode("hello") });

    expect(block.index).toBe(0);
    expect(block.prevHash).toBeNull();
    expect(block.payloadHash).toBeDefined();
    expect(block.blockHash).toBeDefined();

    expect(await verifyBlock(block)).toBe(true);
  });
});