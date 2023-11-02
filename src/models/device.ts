import { z } from "zod";

import { ZodDate } from "../utils/zod-date";

export const Device = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1),
  serialNumber: z.string(),
  createdAt: ZodDate,
  updatedAt: ZodDate,
});
export type Device = z.infer<typeof Device>;
