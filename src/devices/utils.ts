import { Device } from "../models/device";

const separator = ":";

interface DeviceKey {
  userId: string;
  deviceId: string;
}

export function createDeviceKey(userId: string, deviceId: string): string {
  return `${userId}${separator}${deviceId}`;
}

export function parseDeviceKey(key: string): DeviceKey {
  const split = key.split(separator);
  return {
    userId: split[0],
    deviceId: split[1],
  };
}

export function isValidDeviceId(id: string): boolean {
  const result = Device.shape.id.safeParse(id);
  return result.success;
}
