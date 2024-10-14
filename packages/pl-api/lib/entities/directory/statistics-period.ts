import * as v from 'valibot';

const directoryStatisticsPeriodSchema = v.object({
  period: z.string().date(),
  server_count: v.fallback(v.nullable(z.coerce.number()), null),
  user_count: v.fallback(v.nullable(z.coerce.number()), null),
  active_user_count: v.fallback(v.nullable(z.coerce.number()), null),
});

type DirectoryStatisticsPeriod = v.InferOutput<typeof directoryStatisticsPeriodSchema>;

export { directoryStatisticsPeriodSchema, type DirectoryStatisticsPeriod };
