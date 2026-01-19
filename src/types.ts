export type Hash = string;

/**
 * Optional signature metadata for a block.
 * json-ledger does not care how the signature was produced,
 * only that it can be verified via WebCrypto.
 */
export interface SignatureInfo {
  algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
  publicKey: CryptoKey;
  signature: ArrayBuffer;
}

/**
 * A single block in the ledger.
 * The payload is opaque bytes; json-ledger does not interpret it.
 */
export interface LedgerBlock {
  index: number;
  timestamp: number;
  payload: Uint8Array;
  payloadHash: Hash;
  prevHash: Hash | null;
  blockHash: Hash;
  signature?: SignatureInfo;
}