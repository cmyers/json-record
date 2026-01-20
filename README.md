# **json-ledger**

<p align="center">
  <img src="https://github.com/cmyers/json-ledger/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" />
  <img src="https://img.shields.io/npm/v/json-ledger" alt="npm version" />
  <img src="https://img.shields.io/badge/Hash‑Linked%20Ledger-SHA256-success" alt="ledger" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="dependencies" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="types" />
  <img src="https://img.shields.io/github/license/cmyers/json-ledger" alt="license" />
</p>

<h3 align="center">
  A tiny, deterministic, hash‑linked ledger primitive for tamper‑evident append‑only logs.
</h3>

---

A tiny, deterministic, hash‑linked ledger primitive for building tamper‑evident append‑only logs.

json‑ledger gives you **chronological integrity** — a guarantee that a sequence of blocks has not been altered, reordered, or truncated. It does *not* enforce authenticity or authorship; it simply ensures the history is intact.

If you need authenticity (proof of origin), pair json‑ledger with **json‑seal**.

---

## **Why json‑ledger?**

Most applications don’t need a blockchain, consensus protocol, or Merkle tree.  
They just need a simple, deterministic way to ensure that:

- events were appended in order  
- nothing was removed  
- nothing was rewritten  

json‑ledger gives you that primitive — nothing more, nothing less.

It’s ideal for:

- local‑first apps  
- PWAs  
- offline‑capable audit logs  
- tamper‑evident histories  
- deterministic event journals  

---

## **Features**
- Minimal, deterministic block format  
- SHA‑256 hashing for payload and block headers  
- Hash‑linked chain structure (`prevHash`)  
- Optional block‑level signatures  
- Full chain verification  
- Zero dependencies  
- Works in browsers and Node  

---

## **Environment Support**

json‑ledger is fully portable and runs anywhere WebCrypto is available:

- **Node.js** (18+ with global `crypto.subtle`)  
- **Browsers**  
- **Service workers**  
- **Deno**  
- **Bun**  
- **Edge runtimes** (Cloudflare Workers, Vercel, etc.)

No filesystem access, no platform‑specific APIs, no dependencies.  
A pure, deterministic, in‑memory primitive.

---

## **What json‑ledger guarantees**

json‑ledger provides **tamper‑evident ordering**:

- A block’s payload cannot be changed without detection  
- A block’s header cannot be changed without detection  
- Blocks cannot be removed, inserted, or reordered without detection  
- The entire chain can be verified end‑to‑end  

This is the same integrity model used by Git commit chains and Merkle‑style journals.

---

## **What json‑ledger does *not* guarantee**

json‑ledger does **not** provide:

- authenticity  
- authorship  
- permissions  
- identity  
- access control  

If you need to prove *who* created the data, use **json‑seal** to sign the payload before storing it in the ledger.

If you need to prove *who appended a block*, attach a block‑level signature (optional).

json‑ledger stays intentionally minimal.

---

## **When to use json‑ledger**

Use json‑ledger when you need:

- tamper‑evident logs  
- append‑only event history  
- local‑first audit trails  
- deterministic, portable integrity  
- verifiable chains in PWAs or offline apps  

Do **not** use json‑ledger if you need:

- distributed consensus  
- trustless networking  
- smart contracts  
- economic incentives  

json‑ledger is a primitive, not a blockchain.

---

## **Usage**

### **Creating a block**
```ts
import { createBlock } from "json-ledger";

const payload = new TextEncoder().encode("hello world");

const block0 = await createBlock({ payload });
const block1 = await createBlock({ payload, prevBlock: block0 });
```

---

### **Verifying a block**
```ts
import { verifyBlock } from "json-ledger";

const ok = await verifyBlock(block1);
console.log(ok); // true
```

---

### **Verifying a chain**
```ts
import { verifyChain } from "json-ledger";

const chain = [block0, block1];
const ok = await verifyChain(chain);
console.log(ok); // true
```

---

## **Optional: Block‑level signatures**

json‑ledger supports optional signatures on each block.  
If present, they are verified automatically.

```ts
const signature = await crypto.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  privateKey,
  new TextEncoder().encode(block.blockHash)
);

block.signature = {
  algorithm: { name: "ECDSA", hash: "SHA-256" },
  publicKey,
  signature
};
```

This proves **who appended the block**, not who created the payload.

---

## **Recommended: Authenticity with json‑seal**

If you want to prove where the data came from, seal the payload before putting it into the ledger:

```ts
import { seal } from "json-seal";

const sealed = await seal({ foo: 123 }, privateKey, publicKey);

const block = await createBlock({
  payload: new TextEncoder().encode(JSON.stringify(sealed))
});
```

This gives you:

- authenticity of the payload (json‑seal)  
- chronological integrity of the chain (json‑ledger)  

A clean, layered integrity model.

---

## **Storage**

json‑ledger is an in‑memory primitive.  
For persistence, serialize blocks however you like.

A recommended format:

```json
{
  "version": 1,
  "blocks": [ ... ]
}
```

---

## **Design Philosophy**

json‑ledger is intentionally small:

- no I/O  
- no storage format  
- no key management  
- no assumptions about payloads  
- no built‑in authenticity  

It is a **primitive**, not a framework.

You build the policies on top.

---

## **Prior Art**

json‑ledger builds on a long lineage of cryptographic integrity primitives:

- **Git commit chains** — hash‑linked commits ensuring history cannot be rewritten  
- **Merkle‑style hash chains** — linear, tamper‑evident journals used in secure logging  
- **Blockchain data structures** — hash‑linked blocks without consensus, mining, or networking  
- **Certificate Transparency logs** — verifiable append‑only audit logs  
- **Secure audit log research** — cryptographically protected event histories dating back decades  

json‑ledger distills these ideas into a tiny, deterministic, dependency‑free primitive designed for local‑first apps, PWAs, and in‑memory ledgers.

---

## **Status**

**Early but stable.**  
The API is intentionally small and unlikely to change.

---

## **License**

MIT

---