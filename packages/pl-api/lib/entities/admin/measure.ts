import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Measure/} */
const adminMeasureSchema = z.object({
  key: z.string(),
  unit: z.string().nullable().catch(null),
  total: z.coerce.number(),
  human_value: z.string().optional().catch(undefined),
  previous_total: z.coerce.string().optional().catch(undefined),
  data: z.array(z.object({
    date: z.string().datetime({ offset: true }),
    value: z.coerce.string(),
  })),
});

type AdminMeasure = z.infer<typeof adminMeasureSchema>;

export {
  adminMeasureSchema,
  type AdminMeasure,
};
