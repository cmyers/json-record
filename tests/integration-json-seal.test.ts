import { describe, it, expect } from "vitest";
import { generateKeyPair, signPayload, verifyBackup } from "json-seal";
import { createBlock } from "../src/block";
import { verifyBlock, verifyChain } from "../src/verify";

const enc = new TextEncoder();
const dec = new TextDecoder();

describe("json-seal + json-trail integration", () => {
  it("stores a sealed backup inside a ledger block and verifies both layers", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const backup = await signPayload(
      { user: "alice", data: "12345" },
      privateKey,
      publicKey
    );

    const payload = enc.encode(JSON.stringify(backup));
    const block = await createBlock(payload);

    expect(await verifyBlock(block)).toBe(true);

    const decoded = JSON.parse(dec.decode(block.payload));
    const result = await verifyBackup(decoded);
    expect(result.valid).toBe(true);
  });

  it("creates a chain of sealed backups and verifies the chain", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const b1Backup = await signPayload({ count: 1 }, privateKey, publicKey);
    const b2Backup = await signPayload({ count: 2 }, privateKey, publicKey);

    const b1 = await createBlock(enc.encode(JSON.stringify(b1Backup)));

    const b2 = await createBlock(enc.encode(JSON.stringify(b2Backup)), b1);

    expect(await verifyChain([b1, b2])).toBe(true);
  });

  it("detects tampering inside a sealed backup stored in a block", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const backup = await signPayload({ value: 123 }, privateKey, publicKey);
    const block = await createBlock(enc.encode(JSON.stringify(backup)));

    const tampered = { ...backup, payload: { value: 999 } };
    block.payload = enc.encode(JSON.stringify(tampered));

    expect(await verifyBlock(block)).toBe(false);

    const result = await verifyBackup(tampered);
    expect(result.valid).toBe(false);
  });

  it("detects ledger tampering even when the sealed backup is intact", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const backup = await signPayload({ ok: true }, privateKey, publicKey);
    const block = await createBlock(enc.encode(JSON.stringify(backup)));

    block.index = 99;

    expect(await verifyBlock(block)).toBe(false);

    const decoded = JSON.parse(dec.decode(block.payload));
    const result = await verifyBackup(decoded);
    expect(result.valid).toBe(true);
  });

  it("supports chains mixing sealed and unsealed payloads", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const sealed = await signPayload({ a: 1 }, privateKey, publicKey);
    const unsealed = enc.encode("raw-data");

    const b1 = await createBlock(enc.encode(JSON.stringify(sealed)));

    const b2 = await createBlock(unsealed, b1);

    expect(await verifyChain([b1, b2])).toBe(true);
  });

  it("preserves canonicalization for tricky JSON structures", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const tricky = {
      z: 1,
      a: [3, 2, 1],
      nested: { b: true, a: false }
    };

    const backup = await signPayload(tricky, privateKey, publicKey);

    const block = await createBlock(enc.encode(JSON.stringify(backup)));

    const decoded = JSON.parse(dec.decode(block.payload));
    const result = await verifyBackup(decoded);

    expect(result.valid).toBe(true);
    expect(result.payload).toEqual(tricky);
  });

  it("detects tampering of sealed payload in an earlier block", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const b1Backup = await signPayload({ x: 1 }, privateKey, publicKey);
    const b2Backup = await signPayload({ x: 2 }, privateKey, publicKey);

    const b1 = await createBlock(enc.encode(JSON.stringify(b1Backup)));

    const b2 = await createBlock(enc.encode(JSON.stringify(b2Backup)), b1);

    // Tamper with b1 payload
    const tampered = { ...b1Backup, payload: { x: 999 } };
    b1.payload = enc.encode(JSON.stringify(tampered));

    expect(await verifyChain([b1, b2])).toBe(false);
  });

  it("supports chains where each sealed backup uses a different keypair", async () => {
    const k1 = await generateKeyPair();
    const k2 = await generateKeyPair();

    const b1Backup = await signPayload({ id: 1 }, k1.privateKey, k1.publicKey);
    const b2Backup = await signPayload({ id: 2 }, k2.privateKey, k2.publicKey);

    const b1 = await createBlock(enc.encode(JSON.stringify(b1Backup)));

    const b2 = await createBlock(enc.encode(JSON.stringify(b2Backup)), b1);

    expect(await verifyChain([b1, b2])).toBe(true);
  });

  it("fails verification when signature fields are missing", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const backup = await signPayload({ ok: true }, privateKey, publicKey);

    const broken: any = { ...backup };
    delete broken.signature;

    await expect(async () => {
      await verifyBackup(broken);
    }).rejects.toThrow();
  });

  it("round-trips sealed backups through ledger blocks without mutation", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const original = await signPayload({ foo: "bar" }, privateKey, publicKey);

    const block = await createBlock( enc.encode(JSON.stringify(original)));

    const decoded = JSON.parse(dec.decode(block.payload));

    expect(decoded).toEqual(original);
  });

  it("handles large sealed backups (100KB+) inside blocks", async () => {
    const { privateKey, publicKey } = await generateKeyPair();

    const big = { blob: "x".repeat(100_000) };
    const backup = await signPayload(big, privateKey, publicKey);

    const block = await createBlock(enc.encode(JSON.stringify(backup)));

    expect(await verifyBlock(block)).toBe(true);

    const result = await verifyBackup(JSON.parse(dec.decode(block.payload)));
    expect(result.valid).toBe(true);
  });

});