import { z } from "zod";

const PaginationMetadataBase = z.object({
  limit: z.number(),
  complete: z.literal(true),
});
type PaginationMetadataBase = z.infer<typeof PaginationMetadataBase>;

const PaginationMetadataWithCursor = PaginationMetadataBase.extend({
  complete: z.literal(false),
  cursor: z.string(),
});
type PaginationMetadataWithCursor = z.infer<typeof PaginationMetadataWithCursor>;

export const PaginationMetadata = z.union([PaginationMetadataBase, PaginationMetadataWithCursor]);
export type PaginationMetadata = z.infer<typeof PaginationMetadata>;
