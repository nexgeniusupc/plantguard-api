import { json, StatusError } from "itty-router";

import {
  Device,
  DeviceListQuery,
  DeviceListResponse,
  DeviceListResponseData,
  DeviceMetadata,
  DeviceRegistrationRequest,
  DeviceUpdateRequest,
} from "../models/device";
import { assertModel, parseBody } from "../utils/model-parser";
import { PaginationMetadata } from "../utils/pagination";
import { createAuthenticatedRouter } from "../utils/router";
import { createDeviceKey, createSerialNumberKey, isValidDeviceId, parseDeviceKey } from "./utils";

const router = createAuthenticatedRouter({ base: "/api/v1/devices" });

router.get("/", async (request, env): Promise<DeviceListResponse> => {
  const { limit, cursor } = await assertModel(request.query, DeviceListQuery);

  const listKey = createDeviceKey(request.user.id, "");
  const results = await env.devices.list({ limit, cursor, prefix: listKey });
  const data = results.keys.map<DeviceListResponseData>(key => {
    const metadata = DeviceMetadata.parse(key.metadata);
    const parsedKey = parseDeviceKey(key.name);
    return {
      id: parsedKey.deviceId,
      name: metadata.name,
    };
  });

  const pagination: PaginationMetadata = results.list_complete
    ? {
        complete: results.list_complete,
        limit,
      }
    : {
        complete: results.list_complete,
        cursor: results.cursor,
        limit,
      };

  return { data, pagination };
});

router.post("/", async (request, env) => {
  const req = await parseBody(request, DeviceRegistrationRequest);

  const serialNumberKey = createSerialNumberKey(req.serialNumber);
  const possibleOwner = await env.devices.get(serialNumberKey);
  if (possibleOwner) {
    throw new StatusError(400, "The serial number has already been registered");
  }

  const now = new Date();
  const device: Device = {
    ...req,
    id: crypto.randomUUID(),
    userId: request.user.id,
    createdAt: now,
    updatedAt: now,
  };
  const metadata: DeviceMetadata = { name: device.name };
  const deviceKey = createDeviceKey(request.user.id, device.id);

  await env.devices.put(deviceKey, JSON.stringify(device), { metadata });
  await env.devices.put(serialNumberKey, device.userId);

  const headers = new Headers();
  headers.set("Location", `/api/v1/devices/${device.id}`);
  return json(device, { headers, status: 201 });
});

router.get("/:id", async (request, env): Promise<Device> => {
  const { id } = request.params;
  if (!isValidDeviceId(id)) {
    throw new StatusError(400, "Invalid ID");
  }

  const key = createDeviceKey(request.user.id, id);
  const device = await env.devices.get(key);
  if (!device) {
    throw new StatusError(404);
  }

  return Device.parse(JSON.parse(device));
});

router.patch("/:id", async (request, env): Promise<Device> => {
  const { id } = request.params;
  if (!isValidDeviceId(id)) {
    throw new StatusError(400, "Invalid ID");
  }

  const key = createDeviceKey(request.user.id, id);
  const device = await env.devices.get(key);
  if (!device) {
    throw new StatusError(404);
  }
  const parsedDevice = Device.parse(JSON.parse(device));

  const req = await parseBody(request, DeviceUpdateRequest);
  const updatedDevice: Device = {
    ...parsedDevice,
    ...req,
    updatedAt: new Date(),
  };
  const updatedMetadata: DeviceMetadata = { name: updatedDevice.name };

  await env.devices.put(key, JSON.stringify(updatedDevice), { metadata: updatedMetadata });

  return updatedDevice;
});

router.delete("/:id", async (request, env) => {
  const { id } = request.params;
  if (!isValidDeviceId(id)) {
    throw new StatusError(400, "Invalid ID");
  }

  const deviceKey = createDeviceKey(request.user.id, id);
  const device = await env.devices.get(deviceKey);
  if (!device) {
    throw new StatusError(404);
  }
  const parsedDevice = Device.parse(JSON.parse(device));
  const serialNumberKey = createSerialNumberKey(parsedDevice.serialNumber);

  await env.devices.delete(deviceKey);
  await env.devices.delete(serialNumberKey);

  return new Response(undefined, { status: 204 });
});

export { router as devicesRouter };
