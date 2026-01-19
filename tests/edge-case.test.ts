import { describe, it, expect } from "vitest";
import { createBlock } from "../src/block";
import { verifyBlock } from "../src/verify";

describe("edge cases", () => {
  it("handles empty payloads", async () => {
    const block = await createBlock({ payload: new Uint8Array([]) });
    expect(await verifyBlock(block)).toBe(true);
  });

  it("handles a chain of one block", async () => {
    const block = await createBlock({ payload: new Uint8Array([1, 2, 3]) });
    expect(await verifyBlock(block)).toBe(true);
  });
});