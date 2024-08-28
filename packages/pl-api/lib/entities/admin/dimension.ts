import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Dimension/} */
const adminDimensionSchema = z.object({
  key: z.string(),
  data: z.object({
    key: z.string(),
    human_key: z.string(),
    value: z.string(),
    unit: z.string().optional().catch(undefined),
    human_value: z.string().optional().catch(undefined),
  }),
});

type AdminDimension = z.infer<typeof adminDimensionSchema>;

export {
  adminDimensionSchema,
  type AdminDimension,
};
