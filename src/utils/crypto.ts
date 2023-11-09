export type GenerateRandomBytesTransformer = (byte: number) => string;

export function generateRandomBytes(size: number, transformer: GenerateRandomBytesTransformer): string {
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return [...buffer].map(byte => transformer(byte)).join("");
}
