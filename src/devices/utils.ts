import { StatusError } from "itty-router";

import { Device } from "../models/device";
import { createKey, splitKey } from "../utils/kv-keys";

interface DeviceKey {
  userId: string;
  deviceId: string;
}

const deviceKeyPrefix = "device";

export function createDeviceKey(userId: string, deviceId: string): string {
  return createKey([deviceKeyPrefix, userId, deviceId]);
}

const serialNumberKeyPrefix = "serial";

export function createSerialNumberKey(serialNumber: string): string {
  return createKey([serialNumberKeyPrefix, serialNumber]);
}

export function parseDeviceKey(key: string): DeviceKey {
  const split = splitKey(key);
  if (split[0] !== deviceKeyPrefix) {
    throw new StatusError(500, `Found an invalid prefix while parsing a device key: ${split[0]}`);
  }
  return {
    userId: split[1],
    deviceId: split[2],
  };
}

export function isValidDeviceId(id: string): boolean {
  const result = Device.shape.id.safeParse(id);
  return result.success;
}
