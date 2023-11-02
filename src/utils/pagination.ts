import { z } from "zod";

export const PaginationMetadata = z.object({
  limit: z.number(),
  cursor: z.string(),
  complete: z.boolean(),
});
export type PaginationMetadata = z.infer<typeof PaginationMetadata>;
