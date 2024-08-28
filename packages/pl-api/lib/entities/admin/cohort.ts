import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Cohort/} */
const adminCohortSchema = z.object({
  period: z.string().datetime({ offset: true }),
  frequency: z.enum(['day', 'month']),
  data: z.array(z.object({
    date: z.string().datetime({ offset: true }),
    rate: z.number(),
    value: z.number().int(),
  })),
});

type AdminCohort = z.infer<typeof adminCohortSchema>;

export {
  adminCohortSchema,
  type AdminCohort,
};
