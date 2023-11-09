import { StatusError } from "itty-router";

import {
  Device,
  DeviceListQuery,
  DeviceListResponse,
  DeviceListResponseData,
  DeviceMetadata,
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
