export type Hash = string;

export interface LedgerBlock {
  index: number;
  timestamp: number;
  payload: Uint8Array;
  payloadHash: Hash;
  prevHash: Hash | null;
  blockHash: Hash;
}