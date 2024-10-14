import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Cohort/} */
const adminCohortSchema = v.object({
  period: z.string().datetime({ offset: true }),
  frequency: v.picklist(['day', 'month']),
  data: v.array(v.object({
    date: z.string().datetime({ offset: true }),
    rate: v.number(),
    value: v.pipe(v.number(), v.integer()),
  })),
});

type AdminCohort = v.InferOutput<typeof adminCohortSchema>;

export {
  adminCohortSchema,
  type AdminCohort,
};
