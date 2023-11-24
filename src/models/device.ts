import { z } from "zod";

import { PaginationMetadata } from "../utils/pagination";
import { ZodDate } from "../utils/zod-date";

export const Device = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(50),
  serialNumber: z.string().regex(/\d{4}-\d{4}-\d{2}/g),
  createdAt: ZodDate,
  updatedAt: ZodDate,
});
export type Device = z.infer<typeof Device>;

export const DeviceMetadata = Device.pick({ name: true });
export type DeviceMetadata = z.infer<typeof DeviceMetadata>;

export const DeviceListQuery = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cursor: z.string().optional(),
});
export type DeviceListQuery = z.infer<typeof DeviceListQuery>;

export const DeviceListResponseData = Device.pick({ id: true, name: true });
export type DeviceListResponseData = z.infer<typeof DeviceListResponseData>;

export const DeviceListResponse = z.object({
  data: z.array(DeviceMetadata),
  pagination: PaginationMetadata,
});
export type DeviceListResponse = z.infer<typeof DeviceListResponse>;

export const DeviceRegistrationRequest = Device.pick({
  name: true,
  serialNumber: true,
});
export type DeviceRegistrationRequest = z.infer<typeof DeviceRegistrationRequest>;

export const DeviceUpdateRequest = Device.pick({ name: true }).partial();
export type DeviceUpdateRequest = z.infer<typeof DeviceUpdateRequest>;

export const DevicePairRequest = Device.pick({ serialNumber: true }).extend({
  code: z
    .string()
    .min(6)
    .max(6)
    .regex(/^\d{6}$/g),
  secret: z.string(),
  jwt: z.string().optional(),
  expirationTtl: z.number().max(600).optional().default(300),
});
export type DevicePairRequest = z.infer<typeof DevicePairRequest>;

export const DevicePairInitRequest = DevicePairRequest.pick({
  serialNumber: true,
  expirationTtl: true,
});
export type DevicePairInitRequest = z.infer<typeof DevicePairInitRequest>;

export const DevicePairInitResponse = DevicePairRequest.pick({
  code: true,
  secret: true,
});
export type DevicePairInitResponse = z.infer<typeof DevicePairInitResponse>;

export const DevicePairFindQuery = DevicePairRequest.pick({ code: true });
export type DevicePairFindQuery = z.infer<typeof DevicePairFindQuery>;

export const DevicePairFindResponse = DevicePairRequest.pick({ code: true, serialNumber: true });
export type DevicePairFindResponse = z.infer<typeof DevicePairFindResponse>;

export const DevicePairCheckRequest = DevicePairRequest.pick({ code: true, secret: true });
export type DevicePairCheckRequest = z.infer<typeof DevicePairCheckRequest>;

export const DevicePairCheckResponse = DevicePairRequest.pick({ jwt: true });
export type DevicePairCheckResponse = z.infer<typeof DevicePairCheckResponse>;

export const DevicePairConfirmRequest = DevicePairRequest.pick({ code: true }).extend({
  name: Device.shape.name,
});
export type DevicePairConfirmRequest = z.infer<typeof DevicePairConfirmRequest>;

export const DeviceMeasurement = z.object({
  temperature: z.number(),
  humidity: z.number(),
  date: ZodDate,
});
export type DeviceMeasurement = z.infer<typeof DeviceMeasurement>;

export const DeviceMeasurementRequest = DeviceMeasurement.omit({ date: true }).merge(
  Device.pick({ serialNumber: true }),
);
export type DeviceMeasurementRequest = z.infer<typeof DeviceMeasurementRequest>;
