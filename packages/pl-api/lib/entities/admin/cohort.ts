import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Cohort/} */
const adminCohortSchema = v.object({
  period: z.string().datetime({ offset: true }),
  frequency: z.enum(['day', 'month']),
  data: z.array(v.object({
    date: z.string().datetime({ offset: true }),
    rate: z.number(),
    value: z.number().int(),
  })),
});

type AdminCohort = v.InferOutput<typeof adminCohortSchema>;

export {
  adminCohortSchema,
  type AdminCohort,
};
