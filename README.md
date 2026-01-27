<h1 align="center">json-record</h1>

<p align="center">
  <img src="https://github.com/cmyers/json-record/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" />
  <img src="https://img.shields.io/npm/v/json-record" alt="npm version" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="dependencies" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="types" />
  <img src="https://img.shields.io/github/license/cmyers/json-record" alt="license" />
</p>

<h3 align="center">
  A lightweight, zero-dependency library for creating deterministic, tamper-evident append-only logs.
</h3>

---

json-record gives you **chronological integrity**: a guarantee that a sequence of blocks has not been altered, reordered, or truncated. It does not enforce authenticity or authorship; it simply ensures the history is intact.

---

## Why json-record?

Most applications do not need a blockchain, or consensus protocol.  
They just need a simple, deterministic way to ensure that:

- events were appended in order  
- nothing was removed  
- nothing was rewritten  

json-record gives you that primitive, nothing more and nothing less.

It is ideal for:

- local-first apps  
- PWAs  
- offline-capable audit logs  
- tamper-evident histories  
- deterministic event journals  

---

## Features

- Minimal, deterministic block format  
- SHA-256 hashing for payload and block headers  
- Hash-linked chain structure (prevHash)  
- Full chain verification  
- Zero dependencies  
- Works in browsers and Node  

---

## Environment Support

json-record runs anywhere WebCrypto is available:

- Node.js 18+ (global crypto.subtle)  
- Browsers  
- Service workers  
- Deno  
- Bun  
- Edge runtimes (Cloudflare Workers, Vercel, etc.)

No filesystem access, no platform-specific APIs, no dependencies.  
A pure, deterministic, in-memory primitive.

---

## What json-record guarantees

json-record provides **tamper-evident ordering**:

- A block's payload cannot be changed without detection  
- A block's header cannot be changed without detection  
- Blocks cannot be removed, inserted, or reordered without detection  
- The entire chain can be verified end-to-end  

This is the same integrity model used by Git commit chains and linear Merkle-style journals.

---

## What json-record does not guarantee

json-record does not provide:

- authenticity  
- authorship  
- permissions  
- identity  
- access control  

If you need to prove who created the data, seal the payload with **json-seal** before storing it in the trail.

json-record stays intentionally minimal.

---

## Usage

### Creating a block

```ts
import { createBlock } from "json-record";

const payload = new TextEncoder().encode("hello world");

const block0 = await createBlock(payload);
const block1 = await createBlock(payload, block0);
```

---

### Verifying a block

```ts
import { verifyBlock } from "json-record";

const ok = await verifyBlock(block1);
console.log(ok); // true
```

---

### Verifying a chain

```ts
import { verifyChain } from "json-record";

const chain = [block0, block1];
const ok = await verifyChain(chain);
console.log(ok); // true
```

---

## Recommended: Authenticity with json-seal

If you want to prove where the data came from, seal the payload before putting it into the trail:

```ts
import { generateKeyPair, signPayload } from "json-seal";
import { createBlock } from "json-record";

const { privateKey, publicKey } = await generateKeyPair();

const sealed = await signPayload({ foo: 123 }, privateKey, publicKey);

const block = await createBlock(
  new TextEncoder().encode(JSON.stringify(sealed))
);
```

This gives you:

- authenticity of the payload (json-seal)  
- chronological integrity of the chain (json-record)  

A clean, layered integrity model.

---

## Storage

json-record is an in-memory primitive.  
For persistence, serialize blocks however you like.

A recommended format:

```json
{
  "version": 1,
  "blocks": [ ... ]
}
```

json-record does not define a storage format.  
You choose how to store, sync, or replicate the chain.

---

## Design Philosophy

json-record is intentionally small:

- no I/O  
- no storage format  
- no key management  
- no assumptions about payloads  
- no built-in authenticity  

It is a primitive, not a framework.  
You build the policies on top.

---

## Prior Art

json-record builds on a long lineage of cryptographic integrity primitives:

- Git commit chains  
- Merkle-style hash chains  
- Blockchain data structures (without consensus or networking)  
- Certificate Transparency logs  
- Secure audit log research  

json-record distills these ideas into a tiny, deterministic, dependency-free primitive designed for local-first apps, PWAs, and in-memory trails. It offers integrity without the complexity.

---

## License

MIT

---