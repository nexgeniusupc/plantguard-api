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
import { createAuthenticatedRouter } from "../utils/router";
import { createDeviceKey, isValidDeviceId, parseDeviceKey } from "./utils";

const router = createAuthenticatedRouter({ base: "/api/v1/devices" });

router.get("/", async (request, env): Promise<DeviceListResponse> => {
  const { limit, cursor = crypto.randomUUID() } = await assertModel(request.query, DeviceListQuery);

  const results = await env.devices.list({ limit, cursor, prefix: request.user.id });
  const data = results.keys.map<DeviceListResponseData>(key => {
    const metadata = DeviceMetadata.parse(key.metadata);
    const parsedKey = parseDeviceKey(key.name);
    return {
      id: parsedKey.deviceId,
      name: metadata.name,
    };
  });

  return {
    data,
    pagination: {
      limit,
      cursor,
      complete: results.list_complete,
    },
  };
});

router.post("/", async (request, env) => {
  const req = await parseBody(request, DeviceRegistrationRequest);

  const possibleOwner = await env.devices.get(req.serialNumber);
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
  const key = createDeviceKey(request.user.id, device.id);

  await env.devices.put(key, JSON.stringify(device), { metadata });
  await env.devices.put(device.serialNumber, device.userId);

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

  return Device.parse(device);
});

router.patch("/:id", async (request, env): Promise<Device> => {
  const { id } = request.params;
  if (!isValidDeviceId(id)) {
    throw new StatusError(400, "Invalid ID");
  }

  const key = createDeviceKey(request.user.id, id);
  const device = await env.devices.get(`${request.user.id}:${id}`);
  if (!device) {
    throw new StatusError(404);
  }
  const parsedDevice = Device.parse(device);

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

  const key = createDeviceKey(request.user.id, id);
  const device = await env.devices.get(key);
  if (!device) {
    throw new StatusError(404);
  }
  const parsedDevice = Device.parse(device);

  await env.devices.delete(key);
  await env.devices.delete(parsedDevice.serialNumber);

  return new Response(undefined, { status: 204 });
});

export { router as devicesRouter };
