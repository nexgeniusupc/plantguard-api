import { json, StatusError } from "itty-router";

import { authMiddleware } from "../auth/middleware";
import { registerDevice } from "../devices/register-device";
import { createSerialNumberKey } from "../devices/utils";
import {
  DevicePairCheckRequest,
  DevicePairCheckResponse,
  DevicePairConfirmRequest,
  DevicePairFindQuery,
  DevicePairFindResponse,
  DevicePairInitRequest,
  DevicePairInitResponse,
  DevicePairRequest,
} from "../models/device";
import { assertModel, parseBody } from "../utils/model-parser";
import { createRouter } from "../utils/router";
import { createPairKey, generatePairResponse } from "./utils";

const router = createRouter({ base: "/api/v1/pair" });

router.post("/init", async (request, env): Promise<DevicePairInitResponse> => {
  const req = await parseBody(request, DevicePairInitRequest);
  const serialNumberKey = createSerialNumberKey(req.serialNumber);

  const possibleId = await env.devices.get(serialNumberKey);
  if (possibleId) {
    throw new StatusError(400, "The serial number has already been registered");
  }

  const { code, secret } = generatePairResponse();
  const pairKey = createPairKey(code);
  const pairRequest: DevicePairRequest = { ...req, code, secret };

  await env.devices.put(pairKey, JSON.stringify(pairRequest), { expirationTtl: req.expirationTtl });

  return { code, secret };
});

router.get("/find", authMiddleware, async (request, env): Promise<DevicePairFindResponse> => {
  const query = await assertModel(request.query, DevicePairFindQuery);
  const pairKey = createPairKey(query.code);

  const value = await env.devices.get(pairKey);
  if (!value) {
    throw new StatusError(404);
  }
  const pairRequest = DevicePairRequest.parse(JSON.parse(value));

  if (pairRequest.jwt) {
    throw new StatusError(400, "This device has already been paired");
  }

  return { code: query.code, serialNumber: pairRequest.serialNumber };
});

router.post("/check", async (request, env) => {
  const req = await parseBody(request, DevicePairCheckRequest);
  const pairKey = createPairKey(req.code);

  const value = await env.devices.get(pairKey);
  if (!value) {
    throw new StatusError(404);
  }
  const pairRequest = DevicePairRequest.parse(JSON.parse(value));

  if (req.secret !== pairRequest.secret) {
    throw new StatusError(401);
  }

  if (pairRequest.jwt) {
    const response: DevicePairCheckResponse = { jwt: pairRequest.jwt };
    return response;
  }

  return new Response(undefined, { status: 204 });
});

router.post("/confirm", authMiddleware, async (request, env) => {
  // This is safe to override because the auth middleware will make sure
  // we only get here when a valid login is available
  const user = request.user!;

  const req = await parseBody(request, DevicePairConfirmRequest);
  const pairKey = createPairKey(req.code);

  const value = await env.devices.get(pairKey);
  if (!value) {
    throw new StatusError(404);
  }
  const pairRequest = DevicePairRequest.parse(JSON.parse(value));

  if (pairRequest.jwt) {
    throw new StatusError(400, "This device has already been paired");
  }

  const jwt = await env.jwt.sign({
    sub: user.id,
    name: user.fullName,
    email: user.email,
  });

  pairRequest.jwt = jwt;
  await env.devices.put(pairKey, JSON.stringify(pairRequest), { expirationTtl: pairRequest.expirationTtl });

  const device = await registerDevice(env.devices, user, {
    name: req.name,
    serialNumber: pairRequest.serialNumber,
  });

  const headers = new Headers();
  headers.set("Location", `/api/v1/devices/${device.id}`);
  return json(device, { headers, status: 201 });
});

export { router as pairRouter };
