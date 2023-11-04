import { StatusError } from "itty-router";

import { Device, DeviceMetadata, DeviceRegistrationRequest } from "../models/device";
import { User } from "../models/user";
import { createDeviceKey, createSerialNumberKey } from "./utils";

export async function registerDevice(db: KVNamespace, user: User, req: DeviceRegistrationRequest): Promise<Device> {
  const serialNumberKey = createSerialNumberKey(req.serialNumber);
  const possibleOwner = await db.get(serialNumberKey);
  if (possibleOwner) {
    throw new StatusError(400, "The serial number has already been registered");
  }

  const now = new Date();
  const device: Device = {
    ...req,
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };
  const metadata: DeviceMetadata = { name: device.name };
  const deviceKey = createDeviceKey(user.id, device.id);

  await db.put(deviceKey, JSON.stringify(device), { metadata });
  await db.put(serialNumberKey, device.userId);

  return device;
}
