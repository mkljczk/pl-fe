import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Measure/} */
const adminMeasureSchema = v.object({
  key: v.string(),
  unit: v.fallback(v.nullable(v.string()), null),
  total: z.coerce.number(),
  human_value: v.fallback(v.optional(v.string()), undefined),
  previous_total: z.coerce.string().optional().catch(undefined),
  data: z.array(v.object({
    date: z.string().datetime({ offset: true }),
    value: z.coerce.string(),
  })),
});

type AdminMeasure = v.InferOutput<typeof adminMeasureSchema>;

export {
  adminMeasureSchema,
  type AdminMeasure,
};
