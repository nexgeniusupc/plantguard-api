import { DevicePairInitResponse } from "../models/device";
import { generateRandomBytes } from "../utils/crypto";
import { createKey } from "../utils/kv-keys";

const pairKeyPrefix = "pair";

export function createPairKey(pairCode: string): string {
  return createKey([pairKeyPrefix, pairCode]);
}

export function generatePairResponse(): DevicePairInitResponse {
  const code = generateRandomBytes(6, byte => `${byte % 10}`);
  const secret = generateRandomBytes(32, byte => byte.toString(16).padStart(2, "0"));
  return { code, secret };
}
