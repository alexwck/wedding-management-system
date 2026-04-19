import { z } from "zod";

const floorPlanItemMetadataSchema = z.object({
  diameter: z.number().min(3).max(7).optional(),
  length: z.union([z.literal(6), z.literal(7)]).optional(),
  chairIndex: z.number().int().min(0).optional(),
  chairCount: z.number().int().min(0).optional(),
  customType: z.string().max(50).optional(),
});

const floorPlanItemSchema = z.object({
  id: z.uuid(),
  type: z.enum([
    "round_table",
    "long_table",
    "chair",
    "stage",
    "pillar",
    "walkway",
    "misc",
  ]),
  label: z.string().min(1).max(50),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().min(0).max(360),
  parentItemId: z.uuid().nullable(),
  metadata: floorPlanItemMetadataSchema,
});

export const floorPlanInputSchema = z.object({
  width: z.number().positive().max(300),
  height: z.number().positive().max(300),
  items: z.array(floorPlanItemSchema),
});

export type FloorPlanInputFormData = z.infer<typeof floorPlanInputSchema>;
