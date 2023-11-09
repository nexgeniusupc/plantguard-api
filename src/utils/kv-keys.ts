const separator = ":";

export function createKey(values: string[]) {
  return values.join(separator);
}

export function splitKey(key: string) {
  return key.split(separator);
}
