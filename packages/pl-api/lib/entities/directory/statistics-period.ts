import * as v from 'valibot';

const directoryStatisticsPeriodSchema = v.object({
  period: z.string().date(),
  server_count: z.coerce.number().nullable().catch(null),
  user_count: z.coerce.number().nullable().catch(null),
  active_user_count: z.coerce.number().nullable().catch(null),
});

type DirectoryStatisticsPeriod = v.InferOutput<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };
