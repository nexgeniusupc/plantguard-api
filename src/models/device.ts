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
